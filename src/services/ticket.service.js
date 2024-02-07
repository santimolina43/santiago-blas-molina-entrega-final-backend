import ProductService from './product.service.js'
import CartService from './cart.service.js'
import { ticketCollection } from '../dao/models/ticket.model.js'
import UserService from './user.service.js'
import CustomError from './errors/customError.js'
import EErros from './errors/enums.js'
import { v4 as uuidv4} from 'uuid'
import PersistenceFactory from '../dao/persistenceFactory.js'
import { logger } from '../app.js'

const persistanceFactory = new PersistenceFactory()
const productService = new ProductService()
const cartService = new CartService()
const userService = new UserService()

class TicketService {
    #_tickets
    constructor() {
        this.#_tickets = []
        this.ticketsDAO = null
        this.init();
    }

    init = async() => {
        try {
            const PersistenceFactory = await persistanceFactory.getPersistence(ticketCollection) 
            const persistance = new PersistenceFactory()
            this.ticketsDAO = persistance;
        } catch (error) {
            throw new CustomError('ticket.service.js - Error al leer la persistencia: ' + error, EErros.DATABASES_ERROR);
        }
    }

    /********* GET TICKET BY ID *********/
    async getTicketByID(idValue) {
        try {
            // Busco el ticket a traves del id en el array
            const ticketFound = await this.ticketsDAO.findById(idValue)
            if (ticketFound) {
                return ticketFound
            } else {
                throw new CustomError('No se encontró ningun ticket con ese id', EErros.DATA_NOT_FOUND_ERROR)
            }
        } catch (error) {
            logger.error('ticket.service.js - Error en getTicketByID: '+error)
            throw new CustomError(error)
        }
    }

    /********* CREATE TICKET *********/
    async createTicket(amount, purchaserEmail) {
        try {
            // Generamos un código único
            let uniqueCode;
            let isCodeUnique = false;
            while (!isCodeUnique) {
                uniqueCode = uuidv4();
                const existingTicket = await this.ticketsDAO.findOne(uniqueCode);
                isCodeUnique = !existingTicket;
            }
            // Creamos el ticket en la base de datos
            let newTicket = await this.ticketsDAO.createNew(uniqueCode, amount, purchaserEmail);
            return newTicket
        } catch (error) {
            logger.error('ticket.service.js - Error en createTicket: '+error)
            throw new CustomError('ticket.service.js - Error en createTicket: '+error)
        }
    }  

    /********* FINISH PURCHASE IN CART BY ID *********/
    async finishPurchaseInCartById(cartId) {
        try {
            // Obtengo el carrito de compra
            const cart = await cartService.getCartByID(cartId)
            if (!cart._id) throw new CustomError('Error al obtener el carrito de compra', EErros.DATA_NOT_FOUND_ERROR)
            // Obtengo el usuario del carrito
            const cartUser = await userService.getUserByCartId(cart._id.toString())
            if (!cartUser.email) throw new CustomError('Error al obtener el usuario de compra', EErros.DATA_NOT_FOUND_ERROR)
            // Obtengo el mail del usuario
            const userEmail = cartUser.email
            // Obtengo el total de compra
            let totalAmount = 0
            cart.products.forEach(async item => {
                // Si tengo stock del producto, entonces lo sumo y resto stock al producto
                if (item.product.stock >= item.quantity) {
                    const precioProducto = item.product.price;
                    const cantidadProducto = item.quantity;
                    // Suma el producto de la cantidad por el precio de cada producto al total
                    totalAmount += precioProducto * cantidadProducto;
                    // Elimino el producto del carrito
                    await cartService.deleteProductFromCart(cart._id.toString(), item.product._id.toString())
                    // Actualizo el stock del producto
                    let newStock = item.product.stock - item.quantity
                    await productService.updateProduct(item.product._id.toString(), {stock: newStock})
                } 
            })
            // Creamos el ticket de compra
            if (totalAmount > 0) {
                const ticket = await this.createTicket(totalAmount, userEmail)
                if (!ticket._id) throw new CustomError('Error al crear el ticket', EErros.DATABASES_ERROR)
                return ticket
            } else {
                throw new CustomError('No hay productos disponibles para este carrito', EErros.DATABASES_ERROR)
            }
        } catch (error) {
            logger.error('ticket.service.js - Error en createTicket: '+error)
            throw new CustomError(error)
        }
    } 
}

export default TicketService;
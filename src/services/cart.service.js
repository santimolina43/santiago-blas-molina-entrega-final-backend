import ProductService from './product.service.js'
import { cartsCollection } from '../dao/models/carts.model.js'
import CustomError from './errors/customError.js'
import EErros from './errors/enums.js'
import PersistenceFactory from '../dao/persistenceFactory.js'
import { logger } from '../app.js'

const productService = new ProductService('./data/products.json')
const persistanceFactory = new PersistenceFactory()

class CartService {
    #_carts
    constructor() {
        this.#_carts = []
        this.cartsDAO = null
        this.init();
    }
    
    init = async() => {
        try {
            const PersistenceFactory = await persistanceFactory.getPersistence(cartsCollection) 
            const persistance = new PersistenceFactory()
            this.cartsDAO = persistance;
        } catch (error) {
            throw new CustomError('cart.service.js - Error al leer la persistencia: ' + error, EErros.DATABASES_ERROR);
        }
    }

    /********* GET CARTS *********/    
    async getCarts() {
        try {
            // Leo la base de datos y retorno los carritos
            let carts = await this.cartsDAO.getAll()
            if (carts.length === 0) return [];
            this.#_carts = carts
            return this.#_carts
        } catch (error) {
            logger.error('cart.service.js - Error en getCarts: '+error)
            throw new CustomError('cart.service.js - Error en getCarts: '+error, EErros.DATABASES_ERROR)
        }
    }   

    /********* ADD CART *********/
    async addCart(products) {
        try {
            logger.info('cart.service.js - addCart - Start')
            // Creamos el carritp en la base de datos
            let newCart = await this.cartsDAO.createNew(products);
            return newCart
        } catch (error) {
            logger.error('cart.service.js - Error en addCart: '+error)
            throw new CustomError('cart.service.js - Error en addCart: '+error, EErros.DATABASES_ERROR)
        }
    }  

    /********* ADD PRODUCT TO CART *********/
    async addProductToCart(cartID, productID, quantity, method) {
        try {
            // Obtengo el array de carritos de la base de datos
            await this.getCarts() 
            // Verifico que el id de producto sea valido
            let productFound = await productService.getProductByID(productID)
            if (!productFound._id) throw new CustomError('No existe ningun producto con el id: '+productID, EErros.DATA_NOT_FOUND_ERROR)
            if (quantity > 0) {
                // Verifico que haya suficiente stock para agregar el producto al carrito
                if (productFound.stock < quantity) throw new CustomError('No hay stock suficiente para añadir el producto al carrito', EErros.DATA_NOT_FOUND_ERROR)
            }
            // Busco el carrito en la base de datos y devuelvo error si no lo encuentro
            const cartFound = await this.getCartByID(cartID)
            if (!cartFound) throw new CustomError('No existe ningun carrito con el id: '+cartID, EErros.DATA_NOT_FOUND_ERROR)
            const productFoundInCart = cartFound.products.find(item => item.product._id.toString() == productFound._id.toString())
            // Busco el producto en el array de productos del carrito
            if (productFoundInCart) {
                if (quantity > 0) {
                    // Verifico que haya suficiente stock para agregar el producto al carrito
                    if (productFound.stock < (quantity + productFoundInCart.quantity)) throw new CustomError('No hay stock suficiente para añadir el producto al carrito', EErros.DATA_NOT_FOUND_ERROR)
                } else {
                    // Verifico que si se trata de una resta de producto del carrito, la cantidad no quede negativa
                    if (productFoundInCart.quantity + quantity < 0) throw new CustomError('No es posible cargar cantidad negativa en el carrito', EErros.INVALID_TYPES_ERROR)
                }
                if (method==="inc") {
                    // Si encuentro el producto y el method es "inc" entonces incremento la cantidad en quantity
                    await this.cartsDAO.updateCartByIncProductQuantity(cartID, productFound._id, quantity)
                } else if (method==="set") {
                    await this.cartsDAO.updateCartBySetProductQuantity(cartID, productFound._id, quantity)
                } else throw new CustomError('Please specify a valid method to add the products', EErros.INVALID_TYPES_ERROR) 
            } 
            else {
                // Si no encuentro el producto entonces lo añado al carrito con cantidad quantity
                await this.cartsDAO.updateCartByPushProduct(cartID, productFound._id, quantity)
            }
            return (await this.getCarts()).find(item => item._id.toString() === cartID)
        } catch (error) {
            logger.error('cart.service.js - Error en addProductToCart: '+error)
            throw new CustomError('cart.service.js - Error en addProductToCart: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* DELETE PRODUCT FROM CART *********/
    async deleteProductFromCart(cartID, productID) {
        try {
            // Obtengo el array de carritos de la base de datos
            await this.getCarts()
            // Verifico que el id de producto sea valido
            let productFound = await productService.getProductByID(productID)
            if (!productFound._id) throw new CustomError('No existe ningun producto con ese id', EErros.DATA_NOT_FOUND_ERROR) 
            // Busco el carrito en la base de datos y devuelvo error si no lo encuentro
            let cartFound = await this.getCartByID(cartID)
            if (!cartFound) throw new CustomError('No existe ningun carrito con ese id', EErros.DATA_NOT_FOUND_ERROR) 
            // Busco el producto en el array de productos del carrito
            let productFoundInCart = cartFound.products.find(item => item.product._id.toString() === productFound._id.toString())
            if (productFoundInCart) {
                // Si encuentro el producto, lo elimino
                await this.cartsDAO.updateCartByPullProduct(cartID, productFound._id)
            }
            else {
                // Si no encuentro el producto entonces devuelvo error
                throw new CustomError('No existe ningun producto con ese id en el carrito', EErros.DATA_NOT_FOUND_ERROR) 
            }
            return (await this.getCarts()).find(item => item._id.toString() === cartID)
        } catch (error) {
            logger.error('cart.service.js - Error en deleteProductFromCart: '+error)
            throw new CustomError('cart.service.js - Error en deleteProductFromCart: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* GET CART BY ID *********/
    async getCartByID(idValue) {
        // Busco el carrito a traves del id en el array
        try{
            const cartFound = await this.cartsDAO.findOne(idValue)
            if (cartFound) {
                return cartFound
            } else {
                throw new CustomError('No se encontró ningun carrito con el id: '+idValue, EErros.DATA_NOT_FOUND_ERROR)
            }
        } catch (error) {
            logger.error('cart.service.js - Error en getCartByID: '+error)
            throw new CustomError('cart.service.js - Error en getCartByID: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* GET PRODUCTS FROM CART BY ID *********/
    async getCartProductsByID(idValue) {
        try {
            // Obtengo el array de carritos desde el archivo
            await this.getCarts()
            // Busco el carrito a traves del id en el array
            const cartFound = this.#_carts.find(item => item._id.toString() === idValue)
            if (cartFound) {
                // Mapeo de productos usando Promise.all()
                const cartProducts = await Promise.all(cartFound.products.map(async item => {
                    const product = await productService.getProductByID(item.product.toString());
                    return product;
                }));
                return cartProducts
            } else throw new CustomError('No se encontró ningun carrito con ese id', EErros.DATA_NOT_FOUND_ERROR)
        } catch (error) {
            logger.error('cart.service.js - Error en getCartByID: '+error)
            throw new CustomError('cart.service.js - Error en getCartByID: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* DELETE ALL PRODUCTS FROM CART BY ID *********/
    async deleteAllProductsFromCartById(cartId) {
        try {
            // Seteo el array de products a '[]' para el carrito 
            await this.cartsDAO.emptyCartProducts(cartId)
        } catch (error) {
            logger.error('cart.service.js - Error en deleteAllProductsFromCartById: '+error)
            throw new CustomError('cart.service.js - Error en deleteAllProductsFromCartById: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* DELETE PRODUCT FROM ALL CARTS *********/
    async deleteProductFromAllCarts(productID) {
        try {
            // Actualizar todos los carritos que contienen el producto eliminado
            const carts = await this.cartsDAO.findCartsWithProductId(productID);
            carts.forEach(async (cart) => {
                // Filtrar el producto eliminado del array de productos en el carrito
                cart.products = cart.products.filter((product) => product.product.toString() !== productID);
                await cart.save();
            });
        } catch (error) {
            logger.error('Error al eliminar el producto de los carritos: '+error)
            throw new CustomError('Error al eliminar el producto de los carritos: '+error, EErros.DATA_NOT_FOUND_ERROR)
        }
        return 'product deleted successfully'
    }
     
    /********* DELETE CART BY ID *********/
    async deleteCartById(id) {
        try {
            logger.info('cart.service.js - deleteCartById - start')
            // Busco el carrito en la base de datos
            logger.info('cart.service.js - deleteCartById - busco el carrito')
            const isFound = await this.cartsDAO.findOne(id)
            if (!isFound) throw new CustomError('No existe ningun carrito con el id: '+id, EErros.DATA_NOT_FOUND_ERROR) 
            // Elimino el carrito
            logger.info('cart.service.js - deleteCartById - elimino el carrito')
            await this.cartsDAO.deleteOne(id)
            // Busco nuevamente el carrito en la base de datos
            const isFoundAgain = await this.cartsDAO.findOne(id)
            // Busco el user a traves de la propiedad en el array
            if (isFoundAgain) {
                logger.error('cart.service.js - deleteCartById - el carrito no fue eliminado')
                throw new CustomError('Error al eliminar el carrito')
            } else {
                logger.info('cart.service.js - deleteCartById - carrito eliminado correctamente')
                return 'Carrito eliminado correctamente'
            }
        } catch (error) {
            logger.error('cart.service.js - Error en deleteCartById: '+error)
            throw new CustomError(error)
        }
    }       

}

export default CartService;
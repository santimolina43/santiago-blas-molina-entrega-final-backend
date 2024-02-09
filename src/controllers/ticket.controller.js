import TicketService from '../services/ticket.service.js'
import ProductService from '../services/product.service.js'
import CartService from '../services/cart.service.js'

const ticketService = new TicketService()
const productService = new ProductService()
const cartService = new CartService()

export const finishPurchaseInCartById = async (req, res) => {
    const cartId = req.params.cid
    try { 
        // Creamos el ticket de compra
        const ticket = await ticketService.finishPurchaseInCartById(cartId)
        return res.status(200).json({ status: "success", payload: ticket })
    } 
    catch (error) {
        req.logger.error('ticket.controller.js - Error en finishPurchaseInCartById: '+error)
        return res.status(404).json({ status:"error", error: error})
    }
}

export const getTicketView = async (req, res) => { 
    const ticketId = req.params.tid 
    try { 
        const ticket = await ticketService.getTicketByID(ticketId)
        res.render('ticket', ticket)
    } 
    catch (error) {
        req.logger.error('ticket.controller.js - Error en getTicketView: '+error)
        return res.status(404).json({ status:"error", error: error})
    }
}

export const getCancelPurchaseView = async (req, res) => { 
    const ticketId = req.params.tid 
    const cartId = req.params.cid
    try { 
        const ticket = await ticketService.getTicketByID(ticketId)
        ticket.productsBought.forEach(async (product) => {
            // Añado la cantidad quantity nuevamente al stock del producto
            await productService.updateProductAndIncQuantity(product.productId, product.quantity)
            // Agrego el producto al carrito nuevamente
            await cartService.addProductToCart(cartId, product.productId, product.quantity, 'inc')
        })
        res.render('cart')
    } 
    catch (error) {
        req.logger.error('ticket.controller.js - Error en getTicketView: '+error)
        return res.status(404).json({ status:"error", error: error})
    }
}
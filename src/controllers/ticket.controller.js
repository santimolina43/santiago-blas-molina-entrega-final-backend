import TicketService from '../services/ticket.service.js'

const ticketService = new TicketService()

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
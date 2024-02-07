
import ChatService from '../services/chat.service.js'

const chatService = new ChatService()

/************************************/   
/************** VISTAS **************/   
/************************************/ 

export const getChatView = (req, res) => {
    res.render('chat', {}) // de momento solo renderizamos la vista, sin pasarle ningun objeto
}

/************************************/   
/*************** API ****************/   
/************************************/ 

export const postMessage = async (req, res) => {
    try {
        const newMessage = await chatService.addMessage(req.body)
        res.status(200).json({ status: "success", payload: newMessage })
    } catch (error) {
        req.logger.error('chat.controller.js - Error en postMessage: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}
import { messageCollection } from '../dao/models/messages.model.js'
import CustomError from './errors/customError.js'
import EErros from './errors/enums.js'
import PersistenceFactory from '../dao/persistenceFactory.js'
import { logger } from '../app.js'

const persistanceFactory = new PersistenceFactory()

class ChatService {
    #_messages
    constructor() {
        this.#_messages = []
        this.messagesDAO = null
        this.init();
    }

    init = async() => {
        try {
            const PersistenceFactory = await persistanceFactory.getPersistence(messageCollection) 
            const persistance = new PersistenceFactory()
            this.messagesDAO = persistance;
        } catch (error) {
            throw new CustomError('chat.service.js - Error al leer la persistencia: ' + error, EErros.DATABASES_ERROR);
        }
    }

    /********* GET MESSAGES *********/    
    async getMessages() {
        try {
            // Leo la base de datos y retorno los messageos
            let messages = await this.messagesDAO.find() 
            if (messages.length === 0) return [];
            this.#_messages = messages
            return this.#_messages
        } catch (error) {
            logger.error('chat.service.js - Error en getMessages: '+error)
            throw new CustomError('chat.service.js - Error en getMessages: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* ADD MESSAGE *********/
    async addMessage(message) {
        try {
            // Compruebo que esten todos los campos necesarios
            if (!message.user||!message.message) {
                throw new CustomError('No estan informados todos los campos necesarios para enviar el mensaje', EErros.MISSING_FIELDS_ERROR)
            }
            // Añadimos el mensaje a la base de datos
            let newMessage = await this.messagesDAO.createNew(message);
            return newMessage
        } catch (error) {
            logger.error('chat.service.js - Error en addMessage: '+error)
            throw new CustomError(error)
        }
    }  

}


export default ChatService;

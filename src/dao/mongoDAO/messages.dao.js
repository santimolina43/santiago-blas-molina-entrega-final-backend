
import { messagesModel } from "../models/messages.model.js";

export default class MessagesDAODB {
    constructor() {
        this.model = messagesModel;
    }

    find = async() => {
        let results = await this.model.find()
        return results
    }
    
    createNew = async(message) => {
        let result = await this.model.create(message)
        return result
    }

    deleteOne = async(messageID) => {
        let result = await this.model.deleteOne({_id: messageID})
        return result
    }

}

import { ticketsModel } from "../models/ticket.model.js";

export default class TicketsDAODB {
    constructor() {
        this.model = ticketsModel;
    }

    findOne = async(uniqueCode) => {
        let result = await this.model.findOne({code: uniqueCode});
        return result;
    }
    
    findById = async(ticketID) => {
        let result = await this.model.findById(ticketID)
        return result;
    }

    createNew = async(uniqueCode, amount, purchaserEmail, soldProducts) => {
        let result = await this.model.create({code: uniqueCode,
                                              amount: amount,
                                              purchaser: purchaserEmail,
                                              productsBought: soldProducts});
        return result
    }

    deleteOne = async(ticketID) => {
        let result = await this.model.deleteOne({_id: ticketID})
        return result
    }

}
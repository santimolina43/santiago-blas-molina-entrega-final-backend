
import { usersPasswordModel } from "../models/usersPasswords.model.js";

export default class UsersPasswordDAODB {
    constructor() {
        this.model = usersPasswordModel;
    }

    find = async() => {
        let results = await this.model.find()
        return results
    }

    findOne = async(email) => {
        let result = await this.model.findOne({email: email});
        return result;
    }
    
    findById = async(userID) => {
        let result = await this.model.findById(userID)
        return result;
    }

    createNew = async(user) => {
        let result = await this.model.create(user)
        return result
    }

    deleteOne = async(userEmail) => {
        let result = await this.model.deleteOne({email: userEmail})
        return result
    }

    updateUserAndSetCampos = async(userEmail, campos) => {
        let result = await this.model.updateOne({email: userEmail}, {$set: campos})
        return result
    }

}

import { usersModel } from "../models/users.model.js";

export default class UsersDAODB {
    constructor() {
        this.model = usersModel;
    }

    find = async() => {
        let results = await this.model.find()
        return results
    }

    findOne = async(email) => {
        let result = await this.model.findOne({email: email});
        return result;
    }

    findOneByField = async(condition) => {
        let result = await this.model.findOne(condition);
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

    deleteOne = async(userID) => {
        let result = await this.model.deleteOne({_id: userID})
        return result
    }

    updateUserAndSetCampos = async(userID, campos) => {
        let result = await this.model.updateOne({_id: userID}, {$set: campos})
        return result
    }

    updateUserAndSetCamposByEmail = async(userEmail, campos) => {
        let result = await this.model.updateOne({email: userEmail}, {$set: campos})
        return result
    }

    findByIdAndUploadDocuments = async(userID, documentPath, nameOfFile) => {
        let result = await this.model.updateOne({_id: userID}, { $push: { documents: { name: nameOfFile, reference: documentPath } }})
        return result
    }

}
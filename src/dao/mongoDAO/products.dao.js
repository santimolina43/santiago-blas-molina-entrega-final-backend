
import { productModel } from "../models/products.model.js";

export default class ProductsDAODB {
    constructor() {
        this.model = productModel;
    }

    find = async() => {
        let results = await this.model.find()
        return results
    }

    findOne = async(productID) => {
        let result = await this.model.findOne({ _id: productID });
        return result;
    }

    createNew = async(product) => {
        let result = await this.model.create(product)
        return result
    }

    deleteOne = async(productID) => {
        let result = await this.model.deleteOne({_id: productID})
        return result
    }

    updateProductAndSetCampos = async(productID, campos) => {
        let result = await this.model.updateOne({_id: productID}, {$set: campos})
        return result
    }

    paginateProducts = async(query, filters) => {
        console.log(query)
        console.log(filters)
        const products = await this.model.paginate(query, filters)
        return products
    }

}
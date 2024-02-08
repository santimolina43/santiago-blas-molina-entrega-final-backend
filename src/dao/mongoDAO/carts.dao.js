
import { cartModel } from "../models/carts.model.js";

export default class CartsDAODB {
    constructor() {
        this.model = cartModel;
    }

    getAll = async() => {
        let results = await this.model.find()
        return results
    }

    findOne = async(cartID) => {
        let result = await this.model.findOne({ _id: cartID });
        return result;
    }

    findCartsWithProductId = async(productID) => {
        let results = await this.model.find({ 'products.product': productID });
        return results
    }

    createNew = async(products) => {
        let result = await this.model.create({products: products})
        return result
    }

    updateCartByIncProductQuantity = async(cartID, productID, quantity) => {
        let result = await this.model.updateOne({_id: cartID, 'products.product': productID}, 
                                               {$inc: {'products.$.quantity': quantity}})
        return result
    }

    updateCartBySetProductQuantity = async(cartID, productID, quantity) => {
        let result = await this.model.updateOne({_id: cartID, 'products.product': productID}, 
                                               {$set: {'products.$.quantity': quantity}})
        return result
    }

    updateCartByPushProduct = async(cartID, productID, quantity) => {
        let result = await this.model.updateOne({_id: cartID},
                                                {$push: {products: {product: productID, quantity: quantity}}})
        return result
    }
    
    updateCartByPullProduct = async(cartID, productID) => {
        let result = await this.model.findOneAndUpdate({_id: cartID}, 
                                                       {$pull: {products: {product: productID}}})
        return result
    }

    emptyCartProducts = async(cartID) => {
        let result = await this.model.updateOne({_id: cartID},
                                                {$set: {'products': []}})
        return result
    }

    deleteOne = async(cartID) => {
        let result = await this.model.deleteOne({_id: cartID})
        return result
    }

}
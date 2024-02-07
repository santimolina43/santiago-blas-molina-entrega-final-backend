import mongoose from 'mongoose'

export const cartsCollection = 'carts'

export const cartSchema = new mongoose.Schema({
    products: {
        type: [{
            _id: false,
            product: { 
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products'
            },
            quantity: { type: Number }
        }],
        default: []
    }
})

cartSchema.pre('findOne', function() {
    this.populate({
        path: 'products.product',
        match: {_id: {$ne: null}}
    })
})

export const cartModel = mongoose.model(cartsCollection, cartSchema)

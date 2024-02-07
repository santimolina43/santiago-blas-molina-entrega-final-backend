import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { env_parameters_obj } from '../../config/env.config.js'

export const productCollection = 'products'

export const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: String,
    code: { type: String, required: true, unique: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, required: true },
    owner: { type: String, ref: "users", required: true, default: env_parameters_obj.admin.adminAlias},
})

productSchema.plugin(mongoosePaginate)

export const productModel = mongoose.model(productCollection, productSchema)

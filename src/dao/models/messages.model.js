
import mongoose from 'mongoose'

export const messageCollection = 'messages'

const messageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true }
})

export const messagesModel = mongoose.model(messageCollection, messageSchema)


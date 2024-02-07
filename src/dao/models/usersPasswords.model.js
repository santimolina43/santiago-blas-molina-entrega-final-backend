import mongoose from 'mongoose';

export const userPasswordCollection = 'usersPasswords'; 

const userPasswordSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true, ref: "users" },
    token: { type: String, required: true },
    isUsed: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now, expires: 3600} // el registro se elimina de la bd despues de 3600 segundos
})

mongoose.set("strictQuery", false)

export const usersPasswordModel = mongoose.model(userPasswordCollection, userPasswordSchema)

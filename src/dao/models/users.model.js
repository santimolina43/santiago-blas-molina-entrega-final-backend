import mongoose from 'mongoose';

export const userCollection = 'users'; 

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts", required: true },
    role: { type: String, enum: ['user', 'admin', 'premium'], default: 'user' },
    documents: {
        type: [{
            _id: false,
            name: { type: String },
            reference: { type: String }
        }],
        default: [{name: 'profilePhoto', reference: '/imgs/profiles/pngwing.com.png'}]
    },
    last_connection: { type: Date, default: Date.now },
    status: { type: String, enum: ['invalid', 'pending', 'valid'], default: 'invalid' }
})

export const usersModel = mongoose.model(userCollection, userSchema)

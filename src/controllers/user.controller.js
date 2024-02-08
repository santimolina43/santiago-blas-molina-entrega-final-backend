import { logger } from '../app.js';
import { format } from 'date-fns';
import UserService from '../services/user.service.js';
import jwt from 'jsonwebtoken';
import { env_parameters_obj } from '../config/env.config.js';
import UserPasswordService from '../services/userPassword.service.js';
import { sendResetPasswordEmail } from '../utils/resetPasswordEmail.js';
import { generateToken, isValidPassword } from '../middlewares/auth-helpers.js'
import CartService from '../services/cart.service.js';
import { sendDeletedUserNotificacionEmail } from '../utils/sendDeletedUserNotificationEmail.js';

const userService = new UserService()
const cartService = new CartService()
const userPasswordService = new UserPasswordService()

/************************************/   
/**************** API ***************/   
/************************************/ 

export const registerCallback = async (req, res) => {
    try{
        // const userFound = await userService.getUserByIDToBack(req.user._id)
        res.status(200).json({ status:"success", payload: req.user})
    } catch (error) {
        logger.error('user.controller.js - Error en registerCallback: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const login = async (req, res) => {
    try {
        logger.info('user.controller.js - login - start')
        if (!req.user) {
            return res.status(400).send({ status: 'error', error: 'Invalid credentials' })
        }
        const userPayload = {
            _id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            cart: req.user.cart,
            role: req.user.role
        };
        if (userPayload.email !== 'adminCoder@coder.com') {
            logger.info('user.controller.js - login - actualizamos el last_connection del usuario')
            const updatedUser = await userService.updateUserLastConnection(userPayload.email, new Date())
            if (!updatedUser) return res.status(400).json({ status:"error", error: 'Error al actualizar el last_connection del usuario'})
        }    
        let token = jwt.sign(userPayload, 'secret-jwt-santi', {expiresIn: '24h'}) 
        res.cookie(env_parameters_obj.jwt.jwtCookieName, token, { signed: true }).sendSuccess('inicio de sesion exitoso')
    } catch (error) {
        logger.error('user.controller.js - Error en login: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const githubCallback = async(req, res) => {
    if (!req.user) {
        return res.status(400).send({ status: 'error', error: 'Invalid credentials' })
    }
    const userPayload = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        cart: req.user.cart,
        role: req.user.role
      };
    let token = jwt.sign(userPayload, 'secret-jwt-santi', {expiresIn: '24h'}) 
    res.cookie(env_parameters_obj.jwt.jwtCookieName, token, { signed: true }).redirect('/')
}

export const logout = async (req, res) => {
    try {
        logger.info('user.controller.js - logout - start')
        if (req.user.email !== 'adminCoder@coder.com') {
            logger.info('user.controller.js - logout - actualizamos el last_connection del usuario')
            const updatedUser = await userService.updateUserLastConnection(req.user.email, new Date())
            if (!updatedUser) return res.status(400).json({ status:"error", error: 'Error al actualizar el last_connection del usuario'})
        }
        res.clearCookie(env_parameters_obj.jwt.jwtCookieName).redirect('/')
    } catch {
        logger.error('user.controller.js - Error en logout: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const resetPassword = async (req, res) => {
    try {
        const userToReset = req.body.email
        logger.info('user.controller.js - req.body.email: '+userToReset)
        const user = await userService.getUserByEmailToBack(userToReset)
        if (!user) {
            logger.info('user.controller.js - El usuario al que quiere cambiar la contraseña no existe')
            logger.error('user.controller.js - User not found')
            return res.status(404).json({ status:"error", payload: 'No existe ningun usuario con ese email'})
        }
        logger.info('user.controller.js - usuario encontrado')
        logger.info('user.controller.js - generamos el token para el reseteo de contraseña')
        const token = generateToken(userToReset);
        logger.info('user.controller.js - creamos el registro de reseteo en la base de datos')
        const newUserToReset = await userPasswordService.addUserToReset(userToReset, token)
        logger.info('user.controller.js - Envio el email de reseteo de contraseña al usuario')
        await sendResetPasswordEmail(userToReset, token)
        return res.status(200).json({ status: "success", payload: req.body.email })
    } catch (error) {
        logger.error('user.controller.js - Error en resetPassword: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const resetPasswordFinalStep = async (req, res) => {
    try {
        const email = req.body.email
        const newPassword = req.body.password
        // Obtengo el usuario de la base de datos y valido que la nueva contraseña sea distinta
        logger.info('user.controller.js - Obtengo el usuario de la base de datos y valido que la nueva contraseña sea distinta')
        const user = await userService.getUserByEmailToBack(email)
        if (isValidPassword(user, newPassword)) return res.status(404).json({ status:"error", payload: 'Debes usar una contraseña distinta a la contraseña actual'})
        // Actualizo la contraseña del usuario
        logger.info('user.controller.js - Actualizo la contraseña del usuario')
        const updatedUser = await userService.updateUserPassword(email, newPassword)
        // Elimino el registro de reseteo de usuario de la base de datos
        logger.info('user.controller.js - Elimino el registro de reseteo de usuario de la base de datos')
        await userPasswordService.deleteUser(updatedUser.email)
        return res.status(200).json({ status: "success", payload: updatedUser })
    } catch (error) {
        logger.error('user.controller.js - Error en resetPasswordFinalStep: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const changeUserRole = async (req, res) => {
    try {
        logger.info('user.controller.js - changeUserRole - start')
        const userLogged = req.user
        console.log(userLogged)
        const userId = req.params.uid
        logger.info('user.controller.js - changeUserRole - busco el usuario')
        const userToUpdate = await userService.getUserByIDToBack(userId)
        if (!userToUpdate) return res.status(400).json({ status:"error", error: 'user no encontrado'})
        if (userToUpdate.role.toUpperCase() === "PREMIUM") {
            logger.info('user.controller.js - changeUserRole - si el usuario es premium, procedo a pasarlo a user')
            const updatedUser = await userService.updateUserRole(userToUpdate.email, "user")
            return res.status(200).json({ status: "success", payload: updatedUser })
        } 
        logger.info('user.controller.js - changeUserRole - verifico si el usuario tiene status valid para modificar el rol')
        if (userToUpdate.status !== "valid" && userLogged.email === env_parameters_obj.admin.adminEmail) return res.status(501).json({ status:"error", error: 'El usuario debe subir la documentacion correspondiente para poder ser usuario premium'})
        if (userToUpdate.status !== "valid") return res.status(501).json({ status:"error", error: 'Debe subir la documentacion correspondiente para poder ser usuario premium'})
        if (userToUpdate.role.toUpperCase() === "USER") {
            logger.info('user.controller.js - changeUserRole - si el usuario es user y valido, procedo a pasarlo a premium')
            const updatedUser = await userService.updateUserRole(userToUpdate.email, "premium")
            return res.status(200).json({ status: "success", payload: updatedUser })
        }
    } catch (error) {
        logger.error('user.controller.js - Error en changeUserRole: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const deleteUser = async (req, res) => {
    try {
        logger.info('user.controller.js - deleteUser - Start')
        const userId = req.params.uid
        const userLogged = req.user
        if (userLogged._id !== userId && req.user.role.toUpperCase() !== "ADMIN") return res.status(501).json({ status:"error", error: 'No estas autorizado para eliminar este usuario'})
        // Busco al usuario en la base de datos
        logger.info('user.controller.js - deleteInactiveUsers - busco al usuario en la base de datos')
        const user = await userService.getUserByIDToBack(userId)
        if (!user) return res.status(401).json({ status:"error", error: 'Usuario no encontrado'})
        // Elimino de la base de datos el carrito del usuario
        logger.info('user.controller.js - deleteInactiveUsers - elimino carrito del usuario')
        await cartService.deleteCartById(user.cart);
        // Elimino al usuario de la base de datos
        logger.info('user.controller.js - deleteInactiveUsers - elimino al usuario')
        const userToDelete = await userService.deleteUser(userId)
        if (userToDelete !== 'Usuario eliminado correctamente') return res.status(400).json({ status:"error", error: 'No ha sido posible eliminar el usuario'})
        logger.info(`user.controller.js - deleteUser - ${userToDelete}`)
        return res.status(200).json({ status: "success", message: userToDelete })
    } catch (error) {
        logger.error('user.controller.js - Error en deleteUser: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const getUser = async (req, res) => {
    try {
        logger.info('user.controller.js - getUser - Start')
        const userId = req.params.uid
        const userLogged = req.user
        if (userLogged._id !== userId && req.user.role.toUpperCase() !== "ADMIN") return res.status(400).json({ status:"error", error: 'No estas autorizado para buscar este usuario'})
        const userToGet = await userService.getUserByIDToBack(userId)
        return res.status(200).json({ status: "success", payload: userToGet })
    } catch (error) {
        logger.error('user.controller.js - Error en getUser: '+error)
        return res.status(401).json({ status:"error", error: error})
    }
}

export const current = async(req,res) =>{
    const token = req.signedCookies[env_parameters_obj.jwt.jwtCookieName]
    let user = jwt.verify(token, env_parameters_obj.jwt.jwtPrivateKey) // verifico que el token tenga bien la palabra secreta de firma
    if(user) return res.status(200).send({status:"success",payload:user})
    else return res.status(401).send({status:"Error", errorMsg: 'No user logged'})
}

export const postUserDocument = async (req, res) => {
    try {
        logger.info('user.controller.js - postUserDocument - start');
        const userId = req.params.uid;
        const documents = req.files; // Multer coloca los archivos en req.files
        let userUpdated;
        // Verifico que los archivos enviados no esten ya cargados en el usuario
        const user = await userService.getUserByIDToBack(userId)
        if (documents.identification && user.documents.find(doc => doc.name === 'identification')) {
            logger.error('user.controller.js - Error en postUserDocument: Ya has cargado el documento de identificacion. No puedes volver a cargarlo')
            return res.status(500).json({ status:"error", error: 'Ya has cargado el documento de identificacion. No puedes volver a cargarlo'})
        }
        if (documents.proofOfAddress && user.documents.find(doc => doc.name === 'proofOfAddress')) {
            logger.error('user.controller.js - Error en postUserDocument: Ya has cargado el comprobante de domicilio. No puedes volver a cargarlo')
            return res.status(500).json({ status:"error", error: 'Ya has cargado el comprobante de domicilio. No puedes volver a cargarlo'})
        }
        if (documents.bankStatement && user.documents.find(doc => doc.name === 'bankStatement')) {
            logger.error('user.controller.js - Error en postUserDocument: Ya has cargado el comprobante de estado de cuenta. No puedes volver a cargarlo')
            return res.status(500).json({ status:"error", error: 'Ya has cargado el comprobante de estado de cuenta. No puedes volver a cargarlo'})
        }
        // Actualizo el usuario y agrego los archivos que se hayan enviado en la peticion
        logger.info('user.controller.js - postUserDocument - Actualizo los documentos del usuario en base de datos');
        if (documents.identification) userUpdated = await userService.uploadUserDocuments(userId, documents.identification[0].path, 'identification');
        if (documents.proofOfAddress) userUpdated = await userService.uploadUserDocuments(userId, documents.proofOfAddress[0].path, 'proofOfAddress');
        if (documents.bankStatement) userUpdated = await userService.uploadUserDocuments(userId, documents.bankStatement[0].path, 'bankStatement');
        if (userUpdated) {
            // Actualizo el status del usuario para indicar que ya subio archivos
            logger.info('user.controller.js - postUserDocument - Actualizo el status del usuario a pending');
            userUpdated = await userService.updateUserStatus(user.email, 'pending')
            if (userUpdated.documents.find(doc => doc.name === 'identification')
            && userUpdated.documents.find(doc => doc.name === 'proofOfAddress') 
            && userUpdated.documents.find(doc => doc.name === 'bankStatement')) {
                logger.info('user.controller.js - postUserDocument - Actualizo el status del usuario a valid');
                userUpdated = await userService.updateUserStatus(user.email, 'valid')
                return res.status(200).send({status:"success", payload:userUpdated})
            }
            return res.status(200).send({status:"success", payload:userUpdated})
        }
        logger.error('user.controller.js - Error en postUserDocument: No se han cargado documentos para el usuario')
        return res.status(401).json({ status:"error", error: 'No se han cargado documentos para el usuario'})
    } catch (error) {
        logger.error('user.controller.js - Error en postUserDocument: '+error)
        return res.status(401).json({ status:"error", error: error})
    }
};

export const getUsers = async (req, res) => {
    try {
        logger.info('user.controller.js - getUsers - Start')
        const users = await userService.getUsers()
        if (!users) return res.status(401).json({ status: "error", payload: "error al buscar los usuarios" })
        const usersResponse = users.map(user => (
            {
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        ))
        return res.status(200).json({ status: "success", payload: usersResponse })
    } catch (error) {
        logger.error('user.controller.js - Error en getUsers: '+error)
        return res.status(401).json({ status:"error", error: error})
    }
}

export const deleteInactiveUsers = async (req, res) => {
    try {
        logger.info('user.controller.js - deleteInactiveUsers - Start')
        // Busco los usuarios que hayan estado inactivos por mas de dos dias
        logger.info('user.controller.js - deleteInactiveUsers - busco usuarios inactivos')
        const users = await userService.getInactiveUsers(2)
        if (!users) return res.status(401).json({ status: "error", payload: "error al buscar los usuarios inactivos" })
        let counter = 0;
        // Recorro el array de usuarios inactivos
        logger.info('user.controller.js - deleteInactiveUsers - recorro array de usuarios inactivos')
        // Utilizo un bucle for...of para garantizar que las funciones asíncronas se completen en orden
        for (const user of users) {
            // Elimino de la base de datos el carrito de los usuarios inactivos
            logger.info('user.controller.js - deleteInactiveUsers - elimino carrito del usuario inactivo')
            await cartService.deleteCartById(user.cart);
            // Elimino al usuario inactivo de la base de datos
            logger.info('user.controller.js - deleteInactiveUsers - elimino al usuario inactivo')
            await userService.deleteUser(user._id);
            // Envio un email al usuario para notificarlo
            logger.info('user.controller.js - deleteInactiveUsers - envio email de notificacion')
            await sendDeletedUserNotificacionEmail(user.email)
            counter = counter + 1;
        }
        return await res.status(200).json({ status: "success", payload: `${counter} usuarios inactivos fueron eliminados` })
    } catch (error) {
        logger.error('user.controller.js - Error en deleteInactiveUsers: '+error)
        return res.status(401).json({ status:"error", error: error})
    }
}

/************************************/   
/************** VISTAS **************/   
/************************************/ 

export const renderLogin = (req, res) => { 
    res.render('login', {})
}

export const renderRegister = (req, res) => {
    res.render('register', {})
}

export const renderResetPassword = (req, res) => {
    res.render('resetPassword', {})
}

export const renderResetPasswordFinalStep = async (req, res) => {
    try {
        const token = req.params.token
        const userFound = await userPasswordService.getUserByField('token', token)
        // si el usuario no es encontrado, probablemente el token expiró, por eso lo redirijo al usuario a la
        // vista en donde podrá enviar nuevamente un email a su cuenta para reestablecer la contraseña
        if (!userFound) {
            logger.error('user.controller.js - Error en renderResetPasswordFinalStep: El token a expirado o es erroneo. Por favor intente nuevamente')
            return res.status(400).render('resetPassword')
        }   
        res.render('resetPasswordFinalStep', userFound)
    } catch (error) {
        logger.error('user.controller.js - Error en renderResetPasswordFinalStep: '+error)
        return res.status(400).json({ status:"error", error: error})
    }
}

export const administrateUsers = async (req, res) => {
    const userEmail = req.user.email
    req.logger.info('user.controller.js - administrateUsers - start')
    if (userEmail !== 'adminCoder@coder.com') res.status(404).json({ status:"error", payload: "only acces to user admin"})
    else {
    try {
            req.logger.info('user.controller.js - administrateUsers - busco los usuarios')
            const users = await userService.getUsers()
            req.logger.info('user.controller.js - administrateUsers - renderizo la vista de administracion de usuarios')
            const newArray = users.map(u => (
                {
                    first_name: u.first_name, 
                    last_name: u.last_name,
                    email: u.email,
                    last_connection: format(new Date(u.last_connection), "dd/MM/yyyy HH:mm:ss"),
                    id: u._id,
                    role: u.role 
                }
            ))
            const usuarios = {arrayusers: newArray}
            res.render('adminUsers', usuarios)
        } catch (error) {
            req.logger.error('user.controller.js - Error en administrateUsers: '+error)
            return res.status(400).json({ status:"error", payload: error})
        } 
    }
}

export const getUsersProfileView = async (req, res) => {
    const userEmail = req.user.email
    if (userEmail === 'adminCoder@coder.com') {
        const user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: userEmail,
            age: req.user.age
        } 
        res.render('profile', user)
    } else {
        try {
            const usuarioEncontrado = await userService.getUserByEmail(userEmail)
            res.render('profile', usuarioEncontrado)
        } catch (error) {
            req.logger.error('user.controller.js - Error en getUsersProfileView: '+error)
            return res.status(400).json({ status:"error", payload: error})
        } 
    }   
}

export const getUsersCartView = async (req, res) => { 
    const userEmail = req.user.email
    if (userEmail === 'adminCoder@coder.com') res.status(404).json({ status:"error", payload: "admin doesn´t have a cart"})
    else {
        try {
            const usuarioEncontrado = await userService.getUserByEmail(userEmail)
            // if (!usuarioEncontrado._id) return res.status(404).json({ status:"error", payload: "error"})
            // Hago la peticion a la api de los carritos
            fetch(`http://localhost:8080/api/cart/${usuarioEncontrado.cart.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('No se pudo completar la solicitud.');
                    }
                    return response.json(); 
                })
                .then(cartProducts => {
                    res.render('cart',  {cart: cartProducts.payload} )
                })
                .catch(error => {
                    logger.error('Ocurrió un error:', error);
                });
        } catch (error) {
            req.logger.error('user.controller.js - Error en getUsersCartView: '+error)
            return res.status(400).json({ status:"error", payload: error})
        } 
    }
}


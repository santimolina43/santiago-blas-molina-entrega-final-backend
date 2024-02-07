import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { passportCall } from '../middlewares/auth-helpers.js';
import { logger } from '../app.js';
import { env_parameters_obj } from '../config/env.config.js';
import EErros from '../services/errors/enums.js';
import { uploaderProfilePhoto } from '../middlewares/multer-uploader.js';

// Crear el router como un objeto creando una clase es otra forma de hacerlo y es totalmente valida
// y sirve para hacer toda la programacion orientada a objetos
export default class RouterClass{
    constructor() {
        this.router = Router();
        this.init();
    }
    getRouter() {
        return this.router;
    }
    init(){} // Esta inicializacion sera para sus clases heredadas

    get(path, policies, authInstance, authOptions, ...callbacks) { // policies será un array con los roles aceptados en cada ruta
        this.router.get(path, 
                        passportCall(authInstance, authOptions), 
                        this.handlePolicies(policies), 
                        this.generateCustomResponses, 
                        this.applyCallbacks(callbacks));
    };
    post(path, policies, authInstance, authOptions, ...callbacks) {
        if (authInstance === 'register') {
            this.router.post(path, 
                            uploaderProfilePhoto,
                            passportCall(authInstance, authOptions), 
                            this.handlePolicies(policies), 
                            this.generateCustomResponses, 
                            this.applyCallbacks(callbacks));
        } else {   
            this.router.post(path, 
                            passportCall(authInstance, authOptions), 
                            this.handlePolicies(policies), 
                            this.generateCustomResponses, 
                            this.applyCallbacks(callbacks));
        }
    }
    put(path, policies, authInstance, authOptions, ...callbacks) {
        this.router.put(path, 
                        passportCall(authInstance, authOptions), 
                        this.handlePolicies(policies), 
                        this.generateCustomResponses, 
                        this.applyCallbacks(callbacks));
    }
    delete(path, policies, authInstance, authOptions, ...callbacks) {
        this.router.delete(path, 
                           passportCall(authInstance, authOptions), 
                           this.handlePolicies(policies), 
                           this.generateCustomResponses, 
                           this.applyCallbacks(callbacks));
    }
    

    applyCallbacks(callbacks) {
        // mapearemos los callbacks uno a uno, obteniendo todos sus parámetros a partir de ...
        return callbacks.map((callback) => async (...params) => {
            try {
                // apply, ejecutará la funcion callback apuntando directamente a una instancia de la
                // clase, por elo, colocamos this para que se utilice sólo en el contexto de este router,
                // los parámetros son internos de cada callback, sabemos que los params de un callback
                // corresponden a req, res y next
                await callback.apply(this, params)
            } catch (error) {
                logger.error('router.js - applyCallbacks - '+error)
                // params[1] hace referencia a res, por ello puedo mandar un send desde éste
                params[1].status(500).send({status: "error", error: error})
            }
        })
    }

    generateCustomResponses = (req, res, next) => {
        // sendSuccess permitirá que el desarrollador sólo tenga que enviar el payload,
        // ya que el formato se gestionará de manera interna.
        res.sendSuccess = payload => res.send({status: "success", payload})
        res.sendServerError = error => res.status(500).send({status: "error", error})
        res.sendUserError = error => res.status(400).send({status: "error", error})
        res.sendProductError = error => res.status(400).send({status: "error", error})
        next();
    }

    // middleware que comprueba que el usuario tenga un rol que este permitido para entrar
    // a la ruta a la que se esta queriendo acceder
    handlePolicies = policies => (req, res, next) => {
        // logger.info('router.js - handlePolicies - start')
        // logger.info('router.js - handlePolicies - policies: '+policies[0])
        if (policies.includes("PUBLIC")) return next(); // Cualquiera puede entrar
        // puedo enviar el token en el header de la peticion:
                // const authHeaders = req.headers.authorization;
                // if (!authHeaders) return res.status(401).send({status: "error", error: "Unauthorized"});
                // const token = authHeaders.split(" ")[1]; // Removemos el Bearer
        // o puedo enviar el token en una cookie:
        const token = req.signedCookies[env_parameters_obj.jwt.jwtCookieName]
        if (!token) return res.status(500).send({status: "error", errorCode: EErros.UNAUTHORIZED, error: "Unauthorized"})
        // Obtenemos el usuario a partir del token
        let user = jwt.verify(token, env_parameters_obj.jwt.jwtPrivateKey) // verifico que el token tenga bien la palabra secreta de firma
        // ¿El rol del usuario existe dentro del arreglo de políticas?
        if (!policies.includes(user.role.toUpperCase())) return res.status(403).send({status: "error", errorCode: EErros.UNAUTHORIZED, error: "Unauthorized"})
        req.user = user;
        next();
    }
}
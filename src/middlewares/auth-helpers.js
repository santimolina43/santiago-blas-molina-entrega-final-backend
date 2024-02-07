import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport';
import crypto from 'crypto';
import { env_parameters_obj } from '../config/env.config.js';
import { logger } from '../app.js';

// generateToken: al utlilzar jwt.sign:
// El primer argumento es un objeto con la información
// El segundo argumento es la llave privada con la cual se realizará el cifrado
// El tercer argumento es el tiempo de expiración del token.
export const generateToken = (user) => {
    const token = jwt.sign({user}, env_parameters_obj.jwt.jwtPrivateKey, {expiresIn:'24h'})
    return token
} 

// funcion para extraer el valor del token de la cookie
// export const extractCookie = req => (req && req.cookies) ? req.cookies[JWT_COOKIE_NAME] : null
export const extractCookie = (req) => {
    return (req && req.signedCookies) ? req.signedCookies[env_parameters_obj.jwt.jwtCookieName] : null;
}

// funcion middleware para chequear si hay un usuario autenticado con passport.authenticate
export const passportCall = (strategy, authenticateOptions) => {
    return async (req, res, next) => {
        // logger.info('auth-helpers.js - passportCall - start')
        if (strategy == 'next') {next()}
        else {
            // logger.info('auth-helpers.js - passportCall - authenticateOptions: '+authenticateOptions)
            // logger.info('auth-helpers.js - passportCall - strategy: '+strategy)
            // Verifica si se proporcionó una opcion de autenticacion y ajusta la estrategia en consecuencia
            const authenticateOptionsParameter = authenticateOptions ? authenticateOptions : {};
            await passport.authenticate(strategy, authenticateOptionsParameter, function(err, user, info) {
                if (err) return next(err)
                if (!user) return res.status(401).render('login', {error: 'No tengo token!' })
                req.user = user
                // logger.info('auth-helpers.js - passportCall - end')
                next()
            })(req, res, next)
        }
    }
}

// // funcion para manejar los permisos de las rutas para cada rol
// export const handlePolicies = policies => (req, res, next) => {
//     if (policies.includes('PUBLIC')) return next()
//     const user = req.user.user || null
//     if (!policies.includes(user.role.toUpperCase())) {
//         return res.status(403).render('login', { error: 'No autorizado!'})
//     }
//     return next()
// }

// Genera un string aleatorio de length caracteres
export function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charactersLength);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}


//helper function
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
// export const createHash = password => password

//helper function
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)
// export const isValidPassword = (user, password) => true

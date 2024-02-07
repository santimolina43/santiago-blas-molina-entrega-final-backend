import passport from "passport"
import local from 'passport-local'
import GitHubStrategy from 'passport-github2'
import passport_jwt from 'passport-jwt'
import { generateToken, generateRandomString, extractCookie, createHash, isValidPassword} from "../middlewares/auth-helpers.js"
import { logger } from '../app.js'
import { env_parameters_obj } from "./env.config.js"
import UserService from "../services/user.service.js"
import CartService from "../services/cart.service.js"

const cartService = new CartService()
const userService = new UserService()
const localStrategy = local.Strategy
const JWTStrategy = passport_jwt.Strategy

const initializePassport = () => {

    passport.use('register', new localStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async(req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body
        logger.info('passport.config.js - register - Start')
        try {
            logger.info('passport.config.js - register - getUserByEmailToBack')
            const user = await userService.getUserByEmailToBack(username)
            if (user) {
                logger.info('passport.config.js - register - Usuario ya registrado')
                return done(null, false)
            }
            logger.info('passport.config.js - register - addCart')
            const newCart = await cartService.addCart([])
            const newUser = {
                first_name, 
                last_name, 
                email, 
                age, 
                password: createHash(password),
                cart: newCart._id
            }
            let result;
            if (req.file) {
                logger.info('passport.config.js - register - registramos usuario con foto')
                const newUserWithPhoto = { 
                    ...newUser,
                    documents: [{name: 'profilePhoto', reference: `/imgs/profiles/${req.file.filename}`}],
                }
                logger.info('passport.config.js - register - addUser')
                result = await userService.addUser(newUserWithPhoto)
            } else {
                logger.info('passport.config.js - register - registramos usuario sin foto')
                logger.info('passport.config.js - register - addUser')
                result = await userService.addUser(newUser)
            }
            req.user = result
            logger.info('passport.config.js - register - End')
            return done(null, result)
        } catch(err) {
            logger.error('passport.config.js - register - Error: '+err)
            return done(err)
        }
    }))

    passport.use('login', new localStrategy({
        usernameField: 'email',
    }, async(username, password, done) => {
        if (username === env_parameters_obj.admin.adminEmail && password === env_parameters_obj.admin.adminPassword) {
            const adminUser = {
                first_name: 'Admin',
                last_name: 'User',
                email: username,
                age: 30,
                password: password,
                cart: 'adminHasNoCart',
                role: 'admin'
            } 
            return done(null, adminUser)
        } 
        try {
            const user = await userService.getUserByEmailToBack(username)
            if (!user) {
                logger.info('User not found')
                return done(null, false)
            }
            if (!isValidPassword(user, password)) return done(null, false)
            // generamos el token con el user que inicia sesion
            const token = generateToken(user)
            // agregamos el token al user
            user.token = token   
            return done(null, user)
        } catch(err) {}
    }))

    passport.use('github', new GitHubStrategy({
        clientID: env_parameters_obj.gitHub.clientId,
        clientSecret: env_parameters_obj.gitHub.clientSecret,
        callbackURL: 'http://localhost:8080/api/user/githubcallback'
    }, async(accessToken, refreshToken, profile, done) => {
        try {
            const user = await userService.getUserByEmailToBack(profile._json.login+'@gmail.com')
            if (user) return done(null, user) // si el usuario ya existe entonces devolvemos
                                              // null, user 
            // si el usuario no existia en nuestro sitio web, lo agregamos a la base de datos
            const newCart = await cartService.addCart([])
            const newUser = {
                first_name: profile._json.login, 
                last_name: profile._json.login+'slastname', // notar como nos toca rellenar los datos que no vienen desde el perfil
                email: profile._json.login+'@gmail.com',
                age:18, // notar como nos toca rellenar los datos que no vienen desde el perfil
                password: createHash(generateRandomString(10)), // al ser autenticacion de terceros, no podemos asignar un password
                cart: newCart._id
            }
            const result = await userService.addUser(newUser)
            return done(null, result)
        } catch(err) {
            return done('Error to login with github')
        }
    }))

    // estrategia para extraer la cookie del usuairo iniciado en session y verificarlo
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: passport_jwt.ExtractJwt.fromExtractors([extractCookie]),
        secretOrKey: env_parameters_obj.jwt.jwtPrivateKey
    }, async(jwt_payload, done) => {
        done(null, jwt_payload)
    }))


    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser(async(user, done) => {
        if (!user._id) {
            if (user.email === env_parameters_obj.admin.adminEmail) {
                const adminUser = {
                    _id: env_parameters_obj.admin.adminFalseId,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    age: user.age,
                    password: user.password,
                    role: user.role
                }
                done(null, adminUser)
            }
        } else {
            const dbUser = await userService.getUserByIDToBack(user._id)
            done(null, dbUser)
        }
    })

}

export default initializePassport
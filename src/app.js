
import express from 'express'
import {Server} from 'socket.io' 
import mongoose from 'mongoose'
import session from 'express-session'
import passport from "passport";
import cookieParser from "cookie-parser";
import run from './run.js'
import initializePassport from "./config/passport.config.js";
import { env_parameters_obj } from './config/env.config.js'
import { setHandlebars } from './config/handlebars.config.js'
import { createLogger } from './config/logger.config.js';
import { addLogger } from './middlewares/addLogger.js';
import { swaggerInit } from './config/swagger.config.js';

// configuramos el servidor web con express
const app = express()                       
app.use(express.static('./src/public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// configuramos el logger
export const logger = createLogger(env_parameters_obj.app.environment)
app.use(addLogger)

// configuramos swagger
swaggerInit(app)

// configuramos cookie parser
app.use(cookieParser(env_parameters_obj.jwt.jwtPrivateKey))

// configuramos handlebars
setHandlebars(app)

// STORAGE
app.use(session({
    secret: 'mi_secreto', 
    resave: true, 
    saveUninitialized: false 
}))
// Agregamos la inicializacion de passport
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

// me conecto a la base de datos y al servidor local asincronicamente al mismo tiempo
try {
    await mongoose.connect(env_parameters_obj.mongoDB.uri, {
        dbName: env_parameters_obj.mongoDB.name
    })
    logger.info('DB Conected!')
    // abrimos el servidor y lo conectamos con socketServer
    const httpServer = app.listen(env_parameters_obj.app.port, () => logger.info(`HTTP Server Up on port ${env_parameters_obj.app.port}! (${env_parameters_obj.app.environment})`))
    const socketServer = new Server (httpServer)
    httpServer.on("error", (e) => logger.error("ERROR: " + e))
    // corro los routers
    run(socketServer, app)
} catch(err) {
    logger.error(err.message)
}

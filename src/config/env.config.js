import dotenv from 'dotenv'
import { Command } from 'commander'


// defino una funcion que reciba el entorno por parametro de entrada y devuelva las
// variables del archivo .env correspondiente:
const env_parameters = (env) => {

    const environment = env; 

    dotenv.config({
        path: environment == 'PRODUCTION' ? './.env.production' : './.env.development'
    })

    return {
        app: {
            environment: process.env.ENVIRONMENT,
            persistence: process.env.PERSISTENCE,
            port: process.env.PORT,
        },
        mongoDB: {
            uri: process.env.MONGO_DB_URL,
            name: process.env.MONGO_DB_NAME,
        },
        admin: {
            adminEmail: process.env.ADMIN_EMAIL,
            adminPassword: process.env.ADMIN_PASSWORD,
            adminName: process.env.ADMIN_NAME,
            adminFalseId: process.env.ADMIN_FALSE_ID,
            adminAlias: process.env.ADMIN_ALIAS
        },
        gitHub: {
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        },
        jwt: {
            jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
            jwtCookieName: process.env.JWT_COOKIE_NAME
        },
        nodemailer: {
            email: process.env.NODEMAILER_EMAIL,
            password: process.env.NODEMAILER_PASSWORD
        }
    }
}


// configuramos variables de entorno segun los parametros de entrada de lanzamiento
const program = new Command()
program
    .option('-p <port>', 'Puerto del servidor', 8080) 
    .option('--mode <mode>', 'Modo de ejecución', 'PRODUCTION')
program.parse()
export const env_parameters_obj = env_parameters(program.opts().mode)

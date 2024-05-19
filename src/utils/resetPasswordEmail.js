import nodemailer from 'nodemailer'
import { env_parameters_obj } from '../config/env.config.js'
import { logger } from '../app.js'

export const sendResetPasswordEmail = async (userToReset, token) => {
    logger.info('resetPasswordEmail.js - configuro nodemailer')
    const transport = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: env_parameters_obj.nodemailer.email,
            pass: env_parameters_obj.nodemailer.password
        }
    })

    await transport.sendMail({
        from: `Ecommerce API ${env_parameters_obj.nodemailer.email}`,
        to: userToReset,
        subject: 'Reset your password',
        html: `
        <div>
            <h1> You have requested to reset your password </h1>
            <br/>
            <p>Click here to reset your password: https://web-production-59fe.up.railway.app/user/resetPassword/${token}<p/>
            <p>Si no solicitaste un reseteo de contraseña, ignora este correo.<p/>
            <br/>
            <p>Muchas gracias.<p/>
            <p>Saludos,<p/>
            <p>Ecommerce API.<p/>
        </div>
        `
    })
}
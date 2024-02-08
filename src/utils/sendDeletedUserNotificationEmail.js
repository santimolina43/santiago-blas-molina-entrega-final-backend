import nodemailer from 'nodemailer'
import { env_parameters_obj } from '../config/env.config.js'
import { logger } from '../app.js'

export const sendDeletedUserNotificacionEmail = async (deletedUser) => {
    logger.info('resetPasswordEmail.js - configuro nodemailer')
    const transport = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: env_parameters_obj.nodemailer.email,
            pass: env_parameters_obj.nodemailer.password
        }
    })
    logger.info('resetPasswordEmail.js - envio el email')
    await transport.sendMail({
        from: `Ecommerce API ${env_parameters_obj.nodemailer.email}`,
        to: deletedUser,
        subject: 'Your user has been deleted',
        html: `
        <div>
            <h1> Your user has been deleted </h1>
            <br/>
            <p>Due to inactivity in your account for more than 2 days, we have deleted your user.<p/>
            <br/>
            <p>Thanks for being part of our community.<p/>
            <p>Regards,<p/>
            <p>Ecommerce API.<p/>
        </div>
        `
    })
}
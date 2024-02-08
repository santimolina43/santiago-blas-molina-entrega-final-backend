import nodemailer from 'nodemailer'
import { env_parameters_obj } from '../config/env.config.js'
import { logger } from '../app.js'

export const sendDeletedProductEmail = async (productDeleted) => {
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
        to: productDeleted.owner,
        subject: `Your product has been deleted`,
        html: `
        <div>
            <h1> Your product ${productDeleted.title} with code ${productDeleted.code} has been deleted </h1>
            <br/>
            <p> The admin has deleted your product. <p/>
            <p> If you think this is a mistake, please contact us. <p/>
            <br/>
            <p>Thanks for being part of our community.<p/>
            <p>Regards,<p/>
            <p>Ecommerce API.<p/>
        </div>
        `
    })
}
import { logger } from "../app.js"

export const addLogger = (req, res, next) => {
    req.logger = logger
    next()
}
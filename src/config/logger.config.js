import winston from 'winston'

// definimos nuestros propios niveles de loggeo
const customWinstonLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'magenta',
        warning: 'yellow',
        info: 'blue',
        http: 'green',
        debug: 'white'
    }
}

winston.addColors(customWinstonLevels.colors)

export const createLogger = env => {
    if (env === 'PRODUCTION') {
        return winston.createLogger({
            levels: customWinstonLevels.levels, 
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(
                        winston.format.colorize(), 
                        winston.format.simple() 
                    )
                }),
                new  winston.transports.File({
                    filename: 'errors.log',
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.simple() 
                    )
                }),
            ]
        })
    } else if (env === 'DEVELOPMENT') {
        return winston.createLogger({
            levels: customWinstonLevels.levels,
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        // winston.format.timestamp(), // imprime la fecha y la hora de la impresion del log
                        winston.format.colorize(), 
                        winston.format.simple()
                    )
                })
            ]
        })
    }
}

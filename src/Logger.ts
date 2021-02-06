import winston from 'winston'

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.timestamp(),
    transports: [
        new winston.transports.File({filename: 'cmpct.log', level: 'debug' }),
        new winston.transports.Console({
            level: process.env.NODE_ENV === "development" ? 'debug' : 'info',
            format: winston.format.cli({colors:{info: 'blue'}})
        })
    ]
})

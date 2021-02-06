import winston from 'winston'
import appRootPath from 'app-root-path'

export const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({
            filename: 'cmpct.log',
            dirname: appRootPath.resolve('logs'),
            format: winston.format.simple()
        }),
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
            format: winston.format.cli({ colors: { info: 'blue' } })
        })
    ]
})

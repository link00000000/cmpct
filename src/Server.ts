import express = require('express')
import https = require('https')
import fs = require('fs')
import appRootPath from 'app-root-path'
import bodyParser from 'body-parser'
import type winston from 'winston'

export class Server {
    private static SSL_OPTIONS = {
        key: fs.readFileSync(appRootPath.resolve('certs/selfsigned.pem')),
        cert: fs.readFileSync(appRootPath.resolve('certs/selfsigned.cert'))
    }

    public routes = express.Router()

    private app = express()
    private httpsServer = https.createServer(Server.SSL_OPTIONS, this.app)
    private readonly defaultPort = process.env.PORT
        ? parseInt(process.env.PORT)
        : 8080

    constructor(private logger: winston.Logger) {}

    public start(port = this.defaultPort) {
        this.app.use(bodyParser.json())
        this.app.use('/api', this.routes)

        this.httpsServer.listen(port)
        this.onListening(port)
    }

    private logTraffic(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        // this.logger.info(`${req.method} ${req.url} - ${req.ip}`)
    }

    private onListening(port: number, host = 'localhost', protocol = 'https') {
        this.logger.info(`Express listening at ${protocol}://${host}:${port}`)
    }
}

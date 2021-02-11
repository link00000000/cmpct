import express = require('express')
import http = require('http')
import https = require('https')
import fs = require('fs')
import appRootPath, { resolve } from 'app-root-path'
import bodyParser from 'body-parser'
import type winston from 'winston'
import proxy from 'express-http-proxy'

/**
 * An HTTPS server that uses express. Expects SSL files in `certs/` directory.
 * If there are no certs, run `npm run ssl-gencerts` (openssl required).
 * Routes can be added using the `routes` property before starting. Server is
 * started using `start` method.
 */
export class Server {
    public api = express.Router()

    private app = express()
    private server: https.Server | http.Server
    private readonly defaultPort = process.env.PORT
        ? parseInt(process.env.PORT)
        : 8080

    constructor(private logger: winston.Logger) {
        // Use https in development with self-signed certs
        if (process.env.NODE_ENV === 'development') {
            const SSL_OPTIONS = {
                key: fs.readFileSync(
                    appRootPath.resolve('certs/selfsigned.pem')
                ),
                cert: fs.readFileSync(
                    appRootPath.resolve('certs/selfsigned.cert')
                )
            }
            this.server = https.createServer(SSL_OPTIONS, this.app)
        } else {
            this.server = http.createServer(this.app)
        }
    }

    /**
     * Initialize HTTP server and begin serving traffic
     * @param port Port to listen on
     */
    public start(port = this.defaultPort) {
        this.app.use(bodyParser.json())
        this.app.use(this.logTraffic.bind(this))
        this.app.use('/api', this.api)

        if (process.env.NODE_ENV === 'development') {
            // Proxy to react dev server if in development
            this.app.use('/', proxy('http://localhost:3000'))
        } else {
            // Serve static files if in production
            this.app.use('/', express.static(resolve('client/build')))
        }

        this.server.listen(port)
        this.onListening(
            port,
            'localhost',
            process.env.NODE_ENV === 'development' ? 'https' : 'http'
        )
    }

    /**
     * Traffic logging middleware. Must bind current `this` when invoking
     * @param req HTTP request
     * @param _res HTTP response
     * @param next Next method in express pipeline
     */
    private logTraffic(
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction
    ) {
        const { method, url } = req
        const ip = req.headers['x-forwarded-for'] ?? req.ip

        this.logger.info(`${method} ${url} - ${ip}`)
        next()
    }

    /**
     * Event handler triggered when the server is started
     * @param port Port that express is listening on
     * @param host Host that express is listening on
     * @param protocol Protocol that express is using, either `http` or `https`
     */
    private onListening(port: number, host = 'localhost', protocol = 'https') {
        this.logger.info(`Express listening at ${protocol}://${host}:${port}`)
    }
}

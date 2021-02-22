import { ClickHistoryManager } from './ClickHistoryManager'
import express = require('express')
import http = require('http')
import { resolve } from 'app-root-path'
import bodyParser from 'body-parser'
import type winston from 'winston'
import { createProxyMiddleware } from 'http-proxy-middleware'
import ws from 'ws'
import { HistorySocket } from './Sockets/HistorySocket'

/**
 * An HTTP server that uses express. Routes can be added using the `routes`
 * property before starting. Server is started using `start` method.
 */
export class Server {
    public api = express.Router()

    private app = express()
    private server = http.createServer(this.app)
    private wss = new ws.Server({ server: this.server })
    private readonly defaultPort = process.env.PORT
        ? parseInt(process.env.PORT)
        : 8080

    constructor(private logger: winston.Logger) {}

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
            this.app.use(
                '/',
                createProxyMiddleware({
                    target: 'http://localhost:3000',
                    ws: true
                })
            )
        } else {
            // Serve static files if in production
            this.app.use('/', express.static(resolve('client/build')))

            // If no static files are found, the URL probably needs to be
            // handled by react-router-dom. Because of this, react-router-dom
            // will handle 404s
            this.app.get('*', (_req, res) =>
                res.sendFile(resolve('client/build/index.html'))
            )
        }

        // Connect an instance of `HistorySocket` to the webserver, create
        // `ClickHistoryManager to interact with `HistorySocket`
        const historySocket = new HistorySocket(this.wss)
        const clickHistoryManager = new ClickHistoryManager(historySocket)

        // @FIXME This is test data that spams connected clients, should be
        // removed later
        setInterval(() => {
            clickHistoryManager.addEntry('testId', {
                ip: '127.0.0.1',
                time: new Date().getTime(),
                browser: 'None',
                city: 'Akron',
                os: 'Windows 10'
            })
        }, 1000)

        this.server.listen(port)
        this.onListening(port, 'localhost')
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
     */
    private onListening(port: number, host = 'localhost') {
        this.logger.info(`Express listening at http://${host}:${port}`)
    }
}

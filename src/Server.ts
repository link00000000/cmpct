import express = require('express')
import https = require('https')
import fs = require('fs')
import appRootPath from 'app-root-path'
import bodyParser from 'body-parser'

export class Server {
    private static SSL_OPTIONS = {
        key: fs.readFileSync(appRootPath.resolve('certs/selfsigned.pem')),
        cert: fs.readFileSync(appRootPath.resolve('certs/selfsigned.cert'))
    }

    public routes = express.Router()

    private app = express()
    private httpsServer = https.createServer(Server.SSL_OPTIONS, this.app)
    private readonly defaultPort = process.env.PORT ? parseInt(process.env.PORT) : 8080

    public start(port = this.defaultPort) {
        this.app.use(bodyParser.json())
        this.app.use('/api', this.routes)

        this.httpsServer.listen(port)
        Server.onListening(port)
    }

    private static onListening(port: number, host = "localhost", protocol = "https") {
        console.log(`Express listening at ${protocol}://${host}:${port}`)
    }
}

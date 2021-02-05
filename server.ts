import express = require('express')

export class Server {
    public routes = express.Router()

    private app = express()
    private readonly defaultPort = process.env.PORT ? parseInt(process.env.PORT) : 8080

    public start(port = this.defaultPort) {
        this.app.use('/api', this.routes)

        this.app.listen(port)
        Server.onListening(port)
    }

    private static onListening(port: number, host = "localhost", protocol = "http") {
        console.log(`${protocol}://${host}:${port}`)
    }
}

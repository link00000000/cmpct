import { Server } from './src/server'

const server = new Server()

// Redirect shortened link to longer link
server.routes.get('/', (req, res) => {
    res.send("@TODO Redirect shortened link to longer link")
})

server.start()

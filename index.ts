import express = require('express')
import {Server} from './server'

const server = new Server()

// Redirect shortened link to longer link
server.routes.get('/', (req, res) => {
    res.send("@TODO Redirect shortened link to longer link")
})

server.start()

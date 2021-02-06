import { Server } from './src/Server'
import { UrlManager } from './src/UrlManager'
import { logger } from './src/Logger'
import { createRequestHandler } from './src/Routes/Create'

const server = new Server(logger)
const urlManager = new UrlManager(logger)

server.routes.post('/create', createRequestHandler(urlManager))

server.start()
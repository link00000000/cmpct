import { HistorySocket } from './src/Sockets/HistorySocket'
import {
    ClickHistoryEntry,
    ClickHistoryManager
} from './src/ClickHistoryManager'
import { redirectRequestHandler } from './src/Routes/Redirect'
import { Server } from './src/Server'
import { UrlManager } from './src/UrlManager'
import { logger } from './src/Logger'
import { createRequestHandler } from './src/Routes/Create'
import { deleteRequestHandler } from './src/Routes/Delete'

// Instantiate servers
const server = new Server(logger)
const historySocket = new HistorySocket(server.createWSS('/api/history'))

// Instantiate database managers
const urlManager = new UrlManager(logger)
const clickHistoryManager = new ClickHistoryManager(historySocket)

// Initialize servers
server.api.post('/', createRequestHandler(urlManager))
server.api.get('/:shortUrlId', redirectRequestHandler(urlManager))
server.api.delete('/:shortUrlId', deleteRequestHandler(urlManager))

// Start
server.start(parseInt(process.env.PORT ?? String(8080)))

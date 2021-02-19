import { redirectRequestHandler } from './src/Routes/Redirect'
import { Server } from './src/Server'
import { UrlManager } from './src/UrlManager'
import { logger } from './src/Logger'
import { createRequestHandler } from './src/Routes/Create'
import { deleteRequestHandler } from './src/Routes/Delete'

const server = new Server(logger)
const urlManager = new UrlManager(logger)

server.api.post('/', createRequestHandler(urlManager))
server.api.get('/:shortUrlId', redirectRequestHandler(urlManager))
server.api.delete('/:shortUrlId', deleteRequestHandler(urlManager))

server.start(parseInt(process.env.PORT ?? String(8080)))

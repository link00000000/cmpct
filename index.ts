import { Server } from './src/Server'
import { UrlManager } from './src/UrlManager'
import { StatusCodes } from 'http-status-codes'
import { logger } from './src/Logger'

const server = new Server(logger)
const urlManager = new UrlManager(logger)

/**
 * Response type for create endpoint
 */
interface CreateReponse {
    error?: string
    data?: {
        id: string
    }
}

/**
 * Create new short url
 */
server.routes.post<CreateReponse>('/create', async (req, res) => {
    if(req.body.url === undefined) {
        const response: CreateReponse = {
            error: "Key 'url' required"
        }

        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(response)
    }

    try {
        const shortUrl = await urlManager.createShortUrl(req.body.url as string)
        const response: CreateReponse = {
            data: {id: shortUrl}
        }

        return res
            .status(StatusCodes.OK)
            .json(response)

    } catch(error) {
        const response: CreateReponse = { error }
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(response)
    }
})

server.start()

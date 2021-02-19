import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { UrlManager } from '../UrlManager'

/**
 * Request body type for create endpoint
 */
export interface CreateRequestBody {
    url: string
}

/**
 * Response type for create endpoint
 */
export interface CreateResponse {
    error?: string
    data?: {
        id: string
    }
}

/**
 * Create new short url
 */
export const createRequestHandler = (urlManager: UrlManager) => {
    return async (
        req: Request<{}, CreateResponse, CreateRequestBody>,
        res: Response
    ) => {
        // Verify that url was in request body
        if (req.body.url === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Key 'url' required"
            })
        }

        try {
            const shortUrl = await urlManager.createShortUrl(req.body.url)
            return res.status(StatusCodes.OK).json({
                data: { id: shortUrl }
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
        }
    }
}

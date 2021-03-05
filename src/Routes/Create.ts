import { ClickHistoryManager } from './../ClickHistoryManager'
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
        historyId: string
    }
}

/**
 * Create new short url
 */
export const createRequestHandler = (
    urlManager: UrlManager,
    clickHistoryManager: ClickHistoryManager
) => {
    return async (
        req: Request<{}, CreateResponse, CreateRequestBody>,
        res: Response<CreateResponse>
    ) => {
        // Verify that url was in request body
        if (req.body.url === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Key 'url' required"
            })
        }

        try {
            const shortId = await urlManager.createShortUrl(req.body.url)
            const historyId = await clickHistoryManager.createDocument(shortId)

            return res.status(StatusCodes.OK).json({
                data: { historyId }
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
        }
    }
}

import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { UrlManager } from './../UrlManager'

interface DeleteProps {
    shortUrlId: string
}

interface DeleteResponseBody {
    error?: string
}

export const deleteRequestHandler = (urlManager: UrlManager) => {
    return async (
        req: Request<DeleteProps, DeleteResponseBody>,
        res: Response
    ) => {
        // Verify short url id was in request body
        if (req.params.shortUrlId === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: "Key 'shortUrlId' required"
            })
        }

        // Make sure that the key exists
        const exists = await urlManager.exists(req.params.shortUrlId)
        if (!exists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Key does not exist'
            })
        }

        // Remove url from database
        try {
            await urlManager.deleteUrl(req.params.shortUrlId)
            return res.status(StatusCodes.OK).send()
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: error instanceof Error ? error.message : error
            })
        }
    }
}

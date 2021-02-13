import { StatusCodes } from 'http-status-codes'
import type { Request, Response } from 'express'
import { UrlManager } from './../UrlManager'

interface RedirectProps {
    shortUrlId: string
}

interface RedirectResponseBody {
    error?: string
    data?: {
        targetUrl: string
    }
}

export const redirectRequestHandler = (urlManager: UrlManager) => {
    return async (
        req: Request<RedirectProps, RedirectResponseBody>,
        res: Response
    ) => {
        try {
            if (!(await urlManager.exists(req.params.shortUrlId))) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    error: 'Error fetching url, not found'
                })
            }

            const targetUrl = await urlManager.getTargetUrl(
                req.params.shortUrlId
            )
            return res.status(StatusCodes.OK).json({ data: { targetUrl } })
        } catch (error) {
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: error.message ? error.message : String(error) })
        }
    }
}

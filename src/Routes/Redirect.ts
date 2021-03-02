import { logger } from './../Logger'
import {
    ClickHistoryManager,
    PartialClickHistoryEntry
} from './../ClickHistoryManager'
import { StatusCodes } from 'http-status-codes'
import type { Request, Response } from 'express'
import { UrlManager } from './../UrlManager'

export interface RedirectProps {
    shortUrlId: string
}

export type RedirectRequestBody = PartialClickHistoryEntry & {
    platform: string
}

export interface RedirectResponseBody {
    error?: string
    data?: {
        targetUrl: string
    }
}

export const redirectRequestHandler = (urlManager: UrlManager) => {
    return async (
        req: Request<RedirectProps, RedirectResponseBody, RedirectRequestBody>,
        res: Response
    ) => {
        try {
            if (!(await urlManager.exists(req.params.shortUrlId))) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    error: 'Error fetching url, not found'
                })
            }

            // @TODO: Save collected data to db
            ClickHistoryManager.newClickHistoryEntry(req)
                .then((click) => {
                    console.log(JSON.stringify(click))
                })
                .catch((error) => {
                    if (error instanceof Error) {
                        logger.error(error.message)
                    } else {
                        logger.error(error)
                    }
                })

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

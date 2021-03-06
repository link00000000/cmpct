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

/**
 * Save click information to database and redirect client to long URL
 * @param urlManager Instance of UrlManager
 * @param clickHistoryManager Instance of ClickHistoryManager
 */
export const redirectRequestHandler = (
    urlManager: UrlManager,
    clickHistoryManager: ClickHistoryManager
) => {
    return async (
        req: Request<RedirectProps, RedirectResponseBody, RedirectRequestBody>,
        res: Response
    ) => {
        try {
            // Make sure that the short URL exists
            if (!(await urlManager.exists(req.params.shortUrlId))) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    error: 'Error fetching url, not found'
                })
            }

            // Store click information
            try {
                const newClickEntry = await ClickHistoryManager.newClickHistoryEntry(
                    req
                )

                const historyId = await clickHistoryManager.getHistoryId(
                    req.params.shortUrlId
                )

                if (!historyId) {
                    throw new Error(
                        `Could not find history for short ID ${req.params.shortUrlId}`
                    )
                }

                await clickHistoryManager.addClick(historyId, newClickEntry)
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.message)
                } else {
                    logger.error(error)
                }
            }

            // Redirect client to long URL
            const targetUrl = await urlManager.getTargetUrl(
                req.params.shortUrlId
            )

            // @NOTE I think that the client is probably blocking here until all
            // data has been committed to the database before redirecting. This
            // isn't necessary and we might want to send a response early in
            // the function call before commit to the database
            return res.status(StatusCodes.OK).json({ data: { targetUrl } })
        } catch (error) {
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: error.message ? error.message : String(error) })
        }
    }
}

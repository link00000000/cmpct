import { ClickHistory, ClickHistoryManager } from '../ClickHistoryManager'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logger } from '../Logger'

export interface HistoryRequestBody {
    historyId: string
}

export interface HistoryResponseBody {
    error?: string
    data?: {
        shortId: string
        clickHistory: ClickHistory
    }
}

/**
 * Fetch short link and click history
 * @param clickHistoryManager Instance of `ClickHistoryManager`
 */
export const historyRequestHandler = (
    clickHistoryManager: ClickHistoryManager
) => {
    return async (
        req: Request<{}, HistoryResponseBody, HistoryRequestBody>,
        res: Response<HistoryResponseBody>
    ) => {
        if (!req.body.historyId) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Field `historyId` required.' })
        }

        try {
            const historyDocument = await clickHistoryManager.getDocument(
                req.body.historyId
            )

            if (!historyDocument) {
                logger.error('Unable to fetch history, document not found.')
                return res.status(StatusCodes.NOT_FOUND).json({
                    error: 'Unable to fetch history, document not found.'
                })
            }

            return res.status(StatusCodes.OK).json({
                data: {
                    shortId: historyDocument.shortId,
                    clickHistory: historyDocument.clickHistory
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                logger.error(error.message)
            } else {
                logger.error(error)
            }

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: 'Internal server error'
            })
        }
    }
}

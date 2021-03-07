import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { UrlManager } from './../UrlManager'
import {
    ClickHistoryManager,
    ClickHistoryDocument
} from './../ClickHistoryManager'
import { config } from 'dotenv/types'
import axios from 'axios'

interface DeleteProps {
    shortUrlId: string
}

export interface DeleteResponseBody {
    error?: string
}

export const deleteRequestHandler = (
    urlManager: UrlManager,
    clickHistoryManager: ClickHistoryManager
) => {
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

        const doc = await clickHistoryManager.getDocument(req.params.shortUrlId)
        if (doc?.shortId === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Document was not found'
            })
        }

        // Make sure that the key exists
        const exists = await urlManager.exists(doc.shortId)
        if (!exists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Key does not exist'
            })
        }

        // Remove url from database
        try {
            await urlManager.deleteUrl(doc.shortId)
            await clickHistoryManager.removeDocument(doc.historyId)
            return res.status(StatusCodes.OK).send()
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: error instanceof Error ? error.message : error
            })
        }
    }
}

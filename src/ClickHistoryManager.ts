import mongoose from 'mongoose'
import { logger } from './Logger'
import { HistorySocket } from './Sockets/HistorySocket'

export interface ClickHistoryEntry {
    time: number
    ip: string
    city?: string
    state?: string
    country?: string
    provider?: string
    browser?: string
    os?: string
    coordinates?: {
        longitude: number
        latitude: number
    }
    displayDimensions?: {
        width: number
        height: number
    }
    volume?: number
    timezone?: {
        utcOffset: number
        offsetNameLong: string
        offsetNameShort: string
    }
}

export type ClickHistory = ClickHistoryEntry[]

/**
 * Manager of click history transactions. This class is responsible for all
 * interactions with MongoDB instead of interacting with databases directly
 */
export class ClickHistoryManager {
    private mongoClient

    constructor(private socketConnections: HistorySocket) {
        if (process.env.MONGO_URL) {
            mongoose.connect(process.env.MONGO_URL)
            this.mongoClient = mongoose.connection
        } else {
            mongoose.connect('mongodb://localhost:27017/test')
            this.mongoClient = mongoose.connection
        }

        this.mongoClient.on('error', this.mongoErrorHandler)
    }

    /**
     * Handle mongo errors
     * @param error Error
     */
    private mongoErrorHandler = (error: Error | string) => {
        if (error instanceof Error) {
            logger.error(error.message)
        } else {
            logger.error(error)
        }
    }

    addEntry(shortId: string, entry: ClickHistoryEntry) {
        // @TODO Commit to DB
        this.socketConnections.publish(shortId, entry)
        logger.info(`Add new entry to click history of ${shortId}: ${entry.ip}`)
    }
}

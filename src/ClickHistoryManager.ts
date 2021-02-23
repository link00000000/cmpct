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
    constructor(private socketConnections: HistorySocket) {}

    addEntry(shortId: string, entry: ClickHistoryEntry) {
        // @TODO Commit to DB
        this.socketConnections.publish(shortId, entry)
        logger.info(`Add new entry to click history of ${shortId}: ${entry.ip}`)
    }
}

import { MongoClient, Collection } from 'mongodb'
import { logger } from './Logger'
import { HistorySocket } from './Sockets/HistorySocket'
import { RandomId } from './Utils/RandomId'

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

export interface ClickHistoryDocument {
    historyId: string
    shortId: string
    clickHistory: ClickHistory
}

export type ClickHistory = ClickHistoryEntry[]

/**
 * Manager of click history transactions. This class is responsible for all
 * interactions with MongoDB instead of interacting with databases directly
 */
export class ClickHistoryManager {
    private static MONGO_OPTIONS = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    private static DEFAULT_MONGO_URL = 'mongodb://localhost:27017/cmpct'
    private mongoClient = new MongoClient(
        process.env.MONGO_URL ?? ClickHistoryManager.DEFAULT_MONGO_URL,
        ClickHistoryManager.MONGO_OPTIONS
    )
    private collection?: Collection<ClickHistoryDocument>

    constructor(private socketConnections: HistorySocket) {
        this.mongoClient.on('error', this.mongoErrorHandler)
    }

    /**
     * Create a unique history document id
     */
    private async createHistoryId() {
        let historyId = ''
        while (true) {
            historyId = RandomId()
            const result = await this.collection?.findOne({ historyId })
            if (!result) return historyId
        }
    }

    /**
     *  Connect to the mongo database and initialize the analytic collection
     */
    private async mongoSetup() {
        try {
            await this.mongoClient.connect()
            this.collection = this.mongoClient.db('cmpct').collection('history')
        } catch (error) {
            throw error
        }

        logger.info('Mongo connection successful')
    }

    /**
     * Log MongoDB errors
     * @param error Error
     */
    private mongoErrorHandler = (error: Error | string) => {
        if (error instanceof Error) {
            logger.error(error.message)
        } else {
            logger.error(error)
        }
    }

    /**
     * Append click to an existing document and publish change on PubSub channel
     * @param historyId ID of history document
     * @param shortId ID of short link
     * @param entry ClickHistoryEntry
     */
    async addClick(historyId: string, entry: ClickHistoryEntry) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        let doc = await this.collection?.findOne({ historyId })
        if (!doc) throw new Error(`Document not found: ${historyId}`)

        doc.clickHistory = [entry, ...doc.clickHistory]
        await this.collection?.updateOne(
            { historyId },
            { $set: { doc } },
            { upsert: true }
        )

        this.socketConnections.publish(historyId, entry)
        logger.info(`New click entry on ${historyId}: ${entry.ip}`)
    }

    /**
     * Create new ClickHistoryDocument with a unique historyId and insert it
     * with the associated shortId
     * @param shortId The Short URL that the clickers will use
     */
    async addDocument(shortId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        const historyId = await this.createHistoryId()
        await this.collection?.insertOne({
            historyId,
            shortId,
            clickHistory: []
        })
        logger.info(
            `History document created - historyId: ${historyId}, shortId: ${shortId}`
        )
    }

    /**
     * Remove a ClickHistoryDocument
     * @param historyId ID of history document
     */
    async removeDocument(historyId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        await this.collection?.deleteOne({ historyId })
        logger.info(`Document removed: ${historyId}`)
    }

    /**
     * Fetch ClickHistoryDocument
     * @param historyId ID of history document
     */
    async getDocument(historyId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        let doc = await this.collection?.findOne({ historyId })
        logger.info(`Found document associated with historyId: ${historyId}`)
        return doc
    }
}

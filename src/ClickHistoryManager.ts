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
            historyId = RandomId.generateId()
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
            this.collection = this.mongoClient
                .db('cmpct')
                .collection('analytics')

            //@FIXME This will fix the spam function ensuring a document exists with the testId, remove later
            await this.collection?.insertOne({
                historyId: 'testId',
                shortId: 'something',
                clickHistory: []
            })
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
     * Update an entry in an existing document using the history id to search
     * @param historyId Unique Analytic Link
     * @param shortId Short ID
     * @param entry ClickHistoryEntry
     */
    async updateEntry(historyId: string, entry: ClickHistoryEntry) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            let doc = await this.collection?.findOne({ historyId })
            if (!doc) throw new Error(`Document Not Found: ${historyId}`)

            doc.clickHistory = [entry, ...doc.clickHistory]
            await this.collection?.updateOne(
                { historyId },
                { $set: { doc } },
                { upsert: true }
            )
        } catch (error) {
            throw error
        }
        this.socketConnections.publish(historyId, entry)
        logger.info(
            `Add new entry to click history of ${historyId}: ${entry.ip}`
        )
    }

    /**
     * Create new ClickHistoryDocument with a unique historyId and insert it with the associated shortId
     * @param shortId The Short URL that the clickers will use
     */
    async addDocument(shortId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            const historyId = await this.createHistoryId()
            await this.collection?.insertOne({
                historyId,
                shortId,
                clickHistory: []
            })
            logger.info(
                `Document was added to the analytics collection with the historyId: ${historyId} and Short URL: ${shortId}`
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * Remove a ClickHistoryDocument using the historyId
     * @param historyId Unique Analytic Link
     */
    async removeDocument(historyId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            await this.collection?.deleteOne({ historyId })
        } catch (error) {
            throw error
        }
        logger.info(`Document associated with historyId: ${historyId} removed`)
    }

    /**
     * Fetch ClickHistoryDocument using the historyId for the search
     * @param historyId Unique Analytic Link
     */
    async getDocument(historyId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            let doc = await this.collection?.findOne({ historyId })
            logger.info(
                `Found document associated with historyId: ${historyId}`
            )
            return doc
        } catch (error) {
            throw error
        }
    }
}

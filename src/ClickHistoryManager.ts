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
    private mongoClient
    private collection?: Collection<ClickHistoryDocument>

    constructor(private socketConnections: HistorySocket) {
        if (process.env.MONGO_URL) {
            this.mongoClient = new MongoClient(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
        } else {
            this.mongoClient = new MongoClient(
                'mongodb://localhost:27017/cmpct',
                { useNewUrlParser: true, useUnifiedTopology: true }
            )
        }

        this.mongoClient.on('error', this.mongoErrorHandler)
    }

    private async createHistoryId() {
        let isUnique = false
        let historyId = ''
        do {
            historyId = RandomId.generateId()
            if (!(await this.collection?.findOne({ historyId })))
                isUnique = true
        } while (!isUnique)
        return historyId
    }

    private async mongoSetup() {
        try {
            await this.mongoClient.connect()
            await this.mongoClient.db('cmpct').command({ ping: 1 })
            this.collection = this.mongoClient
                .db('cmpct')
                .collection('analytics')
        } catch (error) {
            logger.error(error)
        }

        logger.info('Mongo Connection Successful')
    }

    /**
     * test the functions of the mongo api
     * @TODO Remove this when it is no longer useful
     */
    public async test() {
        try {
            await this.addDocument('shrt')
            let doc = await this.collection?.findOne({ shortId: 'shrt' })

            if (!doc) throw Error(`Document not found`)
            logger.info(JSON.stringify(doc))

            await this.updateEntry(doc.historyId, 'shrt', {
                time: 1,
                ip: 'test'
            })
            logger.info(JSON.stringify(await this.getDocument(doc.historyId)))

            await this.removeDocument(doc.historyId)
        } catch (error) {
            logger.error(error)
        }
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

    /**
     * Update an entry in an existing document using the history id to search
     * @param historyId Unique Analytic Link
     * @param shortId Short URL
     * @param entry New Click
     */
    async updateEntry(
        historyId: string,
        shortId: string,
        entry: ClickHistoryEntry
    ) {
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
            logger.error(error)
        }
        this.socketConnections.publish(shortId, entry)
        logger.info(`Add new entry to click history of ${shortId}: ${entry.ip}`)
    }

    /**
     * Add a new document
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
            logger.error(error)
        }
    }

    /**
     * remove a document
     * @param historyId Unique Analytic Link
     */
    async removeDocument(historyId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            await this.collection?.deleteOne({ historyId })
        } catch (error) {
            logger.error(error)
        }
        logger.info(`Document associated with historyId: ${historyId} removed`)
    }

    /**
     * Retrieve document
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
            logger.error(error)
        }
    }
}

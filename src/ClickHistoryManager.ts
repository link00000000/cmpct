import { MongoClient } from 'mongodb'
import { logger } from './Logger'
import { HistorySocket } from './Sockets/HistorySocket'
import { urlAlphabet } from 'nanoid'
import { Collection } from 'mongodb'

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
    UAL: string
    short: string
    clicks: ClickHistory
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

    private coll?: Collection<ClickHistoryDocument>

    private async mongoSetup() {
        try {
            await this.mongoClient.connect()
            await this.mongoClient.db('cmpct').command({ ping: 1 })
            this.coll = this.mongoClient.db('cmpct').collection('analytics')
        } catch (error) {
            logger.error(error)
        }

        logger.info('Mongo Connection Successful')
    }

    public async test() {
        try {
            await this.addDocument(
                'http://cmpct.tk/history/UAL',
                'http://cmpct.tk/shrt'
            )
            await this.updateEntry(
                'http://cmpct.tk/history/UAL',
                'http://cmpct.tk/shrt',
                { time: 1, ip: 'test' }
            )
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

    async updateEntry(UAL: string, shortId: string, entry: ClickHistoryEntry) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            let doc = await this.coll?.findOne({ UAL })
            if (!doc) throw new Error(`Document Not Found: ${UAL}`)
            doc.clicks = [entry, ...doc.clicks]
            await this.coll?.updateOne(
                { UAL },
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
     * @param UAL The Unique Analytic Link
     * @param shortID The Short URL that the clickers will use
     */
    async addDocument(UAL: string, shortID: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            await this.coll?.insertOne({
                UAL,
                short: shortID,
                clicks: []
            })
        } catch (error) {
            logger.error(error)
        }
        logger.info(
            `Document was added to the analytics collection with the UAL: ${UAL} and Short URL: ${shortID}`
        )
    }
}

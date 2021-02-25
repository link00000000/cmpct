import { MongoClient } from 'mongodb'
import { logger } from './Logger'
import { HistorySocket } from './Sockets/HistorySocket'
import nanoid from 'nanoid'
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
    private static alphaUAL =
        '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    private static lengthUAL = 6
    private static generateUAL = nanoid.customAlphabet(
        ClickHistoryManager.alphaUAL,
        ClickHistoryManager.lengthUAL
    )

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

    private async createUAL() {
        let isUnique = false
        let UAL = ''
        do {
            UAL = ClickHistoryManager.generateUAL()
            if (!(await this.coll?.findOne({ UAL }))) isUnique = true
        } while (!isUnique)
        return UAL
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

    /**
     * test the functions of the mongo api
     */
    public async test() {
        try {
            await this.addDocument('shrt')
            let doc = await this.coll?.findOne({ short: 'shrt' })

            if (!doc) throw Error(`Document not found`)
            logger.info(JSON.stringify(doc))

            await this.updateEntry(doc.UAL, 'shrt', { time: 1, ip: 'test' })
            logger.info(JSON.stringify(await this.getDocument(doc.UAL)))

            await this.removeDocument(doc.UAL)
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
     * Update an entry in an existing document using the UAL to search
     * @param UAL Unique Analytic Link
     * @param shortId Short URL
     * @param entry New Click
     */
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
    async addDocument(shortID: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            const UAL = await this.createUAL()
            await this.coll?.insertOne({
                UAL,
                short: shortID,
                clicks: []
            })
            logger.info(
                `Document was added to the analytics collection with the UAL: ${UAL} and Short URL: ${shortID}`
            )
        } catch (error) {
            logger.error(error)
        }
    }

    /**
     * remove a document
     * @param UAL Unique Analytic Link
     */
    async removeDocument(UAL: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            await this.coll?.deleteOne({ UAL })
        } catch (error) {
            logger.error(error)
        }
        logger.info(`Document associated with UAL: ${UAL} removed`)
    }

    /**
     * Retrieve document
     * @param UAL Unique Analytic Link
     */
    async getDocument(UAL: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        try {
            let doc = await this.coll?.findOne({ UAL })
            logger.info(`Found document associated with UAL: ${UAL}`)
            return doc
        } catch (error) {
            logger.error(error)
        }
    }
}

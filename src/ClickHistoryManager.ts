import { MongoClient } from 'mongodb'
import { logger } from './Logger'
import { HistorySocket } from './Sockets/HistorySocket'
import { urlAlphabet } from 'nanoid'

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

        this.mongoSetup()
        this.test()
        this.mongoClient.on('error', this.mongoErrorHandler)
    }

    private async mongoSetup() {
        try {
            await this.mongoClient.connect()
            await this.mongoClient.db('cmpct').command({ ping: 1 })
            await this.mongoClient.db('cmpct').createCollection('analytics')
        } catch (error) {
            logger.error(error)
        }

        logger.info('Mongo Connection Successful')
    }

    private async test() {
        await this.addDocument(
            'http://cmpct.tk/some-test-url',
            'http://cmpct.tk/shrt'
        )
        await this.addEntry('http://cmpct.tk/shrt', { time: 1, ip: 'test' })
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

    async addEntry(shortId: string, entry: ClickHistoryEntry) {
        // @TODO Commit to DB
        try {
            let doc = await this.mongoClient
                .db('cmpct')
                .collection('analytics')
                .findOne({})
            console.log('================================================')
            console.log(doc)
            console.log('================================================')
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
        try {
            await this.mongoClient
                .db('cmpct')
                .collection('analytics')
                .insertOne({
                    UAL: UAL,
                    shrt: shortID,
                    clickers: {}
                })
        } catch (error) {
            logger.error(error)
        }
        logger.info(
            `Document was added to the analytics collection with the UAL: ${UAL} and Short URL: ${shortID}`
        )
    }
}

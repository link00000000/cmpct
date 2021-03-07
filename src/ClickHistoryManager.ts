import { Request } from 'express'
import { MongoClient, Collection } from 'mongodb'
import { logger } from './Logger'
import {
    RedirectProps,
    RedirectRequestBody,
    RedirectResponseBody
} from './Routes/Redirect'
import { HistorySocket } from './Sockets/HistorySocket'
import { RandomId } from './Utils/RandomId'
import { IPInfoLookup } from './Utils/IPInfoLookup'
import UAParser from 'ua-parser-js'

export type PartialClickHistoryEntry = Partial<ClickHistoryEntry>

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
    language?: string
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

        let historyDocument = await this.collection?.findOne({ historyId })
        if (!historyDocument)
            throw new Error(`Document not found: ${historyId}`)

        const newClickHistory = [entry, ...historyDocument.clickHistory]

        await this.collection?.updateOne(
            { historyId },
            { $set: { clickHistory: newClickHistory } },
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
    async createDocument(shortId: string) {
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

        return historyId
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

    /**
     * Get the history ID that corresponds to the short ID
     * @param shortId ID of short URL
     */
    async getHistoryId(shortId: string) {
        if (!this.mongoClient.isConnected()) {
            await this.mongoSetup()
        }

        let document = await this.collection?.findOne({ shortId })
        return document?.historyId
    }

    /**
     * Create an instance of `ClickHistoryEntry` from an express request
     * @param request HTTP request from express that contains a payload containing click information
     */
    static async newClickHistoryEntry(
        request: Request<
            RedirectProps,
            RedirectResponseBody,
            RedirectRequestBody
        >
    ): Promise<ClickHistoryEntry> {
        let ipAddress: string

        if (
            request.headers &&
            request.headers['x-forwarded-for'] &&
            request.headers['x-forwarded-for'].length > 0
        ) {
            ipAddress = request.headers['x-forwarded-for'][0]
        } else {
            ipAddress = request.ip
        }

        // If we are in development mode, we can use the environment variable
        // `IP_LOOKUP_ADDRESS` to override the IP address used to fetch
        // information. Useful for testing
        if (
            process.env.NODE_ENV === 'development' &&
            process.env.IP_LOOKUP_ADDRESS
        ) {
            ipAddress = process.env.IP_LOOKUP_ADDRESS
        }

        if (!ipAddress) {
            throw new TypeError('IP address is undefined')
        }

        const userAgent = new UAParser(
            request.headers['user-agent'] ?? ''
        ).getResult()

        const {
            city,
            state,
            country,
            coordinates,
            provider,
            timezone
        } = await IPInfoLookup(ipAddress)

        // Parse OS from user agent
        const os =
            (userAgent.os.name as string) +
            (userAgent.os.version && ' ' + userAgent.os.version) +
            (userAgent.cpu.architecture &&
                ' (' + userAgent.cpu.architecture + ')')

        // Parse browser from user agent
        const browser =
            (userAgent.browser.name as string) +
            (userAgent.browser.version && ' ' + userAgent.browser.version) +
            (userAgent.engine.name && ' (' + userAgent.engine.name + ')')

        return {
            ip: ipAddress,
            time: new Date().getTime(),
            browser,
            os,
            city,
            state,
            country,
            coordinates,
            displayDimensions: request.body.displayDimensions,
            language: request.body.language,
            provider,
            timezone
        }
    }
}

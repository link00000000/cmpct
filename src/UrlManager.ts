import redis from 'async-redis'
import nanoid from 'nanoid'
import type winston from 'winston'

export class UrlManager {
    private static shortUrlGeneratorAlphabet =
        '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    private static shortUrlGeneratorLength = 8
    private static shortUrlGenerator = nanoid.customAlphabet(
        UrlManager.shortUrlGeneratorAlphabet,
        UrlManager.shortUrlGeneratorLength
    )

    private redisClient = redis.createClient()

    constructor(private logger: winston.Logger) {
        this.redisClient.on('error', this.redisErrorHandler)
    }

    /**
     * Handle redis errors
     * @param error Error
     */
    private redisErrorHandler = (error: Error | string) => {
        this.logger.error(error)
    }

    /**
     * Shorten a url and store it to backing store
     * @param url Unshortened url
     */
    public async createShortUrl(url: string) {
        // In the extremely unlikely chance that a short URL is already used,
        // it will cause a collision. We need to generate a new one
        let shortUrlId: string
        let isUnique = false
        do {
            shortUrlId = UrlManager.shortUrlGenerator()

            try {
                isUnique = !(await this.redisClient.exists(shortUrlId))
            } catch (error) {
                this.redisErrorHandler(error)
                throw error
            }
        } while (!isUnique)

        await this.redisClient.set(shortUrlId, url)
        this.logger.info(`Created new url: ${shortUrlId} -> ${url}`)

        return shortUrlId
    }
}

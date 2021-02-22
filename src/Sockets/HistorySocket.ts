import ws from 'ws'
import { PubSub } from '../PubSub'
import { logger } from '../Logger'
import { ClickHistoryEntry } from '../ClickHistoryManager'

/**
 * Incoming data to `HistorySocket`
 */
export interface HistorySocketPayload {
    action: 'subscribe' | 'unsubscribe'
    channel: string
}

/**
 * Outgoing data from `HistorySocket`
 */
export interface HistorySocketResponse {
    error?: boolean
    data: ClickHistoryEntry | { message: string }
}

/**
 * Standard success response message
 */
const HISTORY_SOCKET_RESPONSE_SUCCESS = JSON.stringify({
    data: { message: 'OK' }
})

/**
 * Manages all websocket communication relating to click history
 */
export class HistorySocket {
    /**
     * All channels being that are being tracked by `HistorySocket`. A channel
     * is an event that a client can subscribe to. For instance, a client might
     * subscribe to clicks of a url, so they might subscribe to the channel with
     * the ID of the url. When the server makes changes to data in the database,
     * it can also publish those changes to the channel (PubSub)
     */
    private channels = new Map<string, PubSub>()

    constructor(private wss: ws.Server) {
        wss.on('connection', (socket: ws) => {
            logger.info('New connection to history socket')

            socket.on('message', (data) => {
                // Parse payload from JSON string
                let payload: HistorySocketPayload
                try {
                    payload = JSON.parse(
                        data.toString()
                    ) as HistorySocketPayload
                } catch (error) {
                    // Error parsing JSON string
                    logger.error(
                        'Unable to parse payload: ' + data.toString().trim()
                    )

                    const response: HistorySocketResponse = {
                        error: true,
                        data: { message: 'Unable to parse payload' }
                    }
                    socket.send(JSON.stringify(response))

                    return
                }

                const { action, channel } = payload
                if (!action || !channel) {
                    // All required data fields were not provided
                    logger.error('Malformed payload: ' + data.toString().trim())

                    const response: HistorySocketResponse = {
                        error: true,
                        data: { message: 'Malformed payload' }
                    }
                    socket.send(JSON.stringify(response))

                    return
                }

                // Subscribe new client, create PubSub if it doesn't already exist
                if (action == 'subscribe') {
                    // If there is currently not a PubSub for a given channel, create one
                    if (!this.channels.has(channel)) {
                        this.channels.set(channel, new PubSub())
                    }

                    try {
                        // Subscribe current socket to PubSub channel
                        this.channels.get(channel)?.subscribe(socket)
                    } catch (error) {
                        // Error subscribing socket to PubSub
                        const { message } = error as Error
                        logger.error(message + ' to ' + channel)

                        const response: HistorySocketResponse = {
                            error: true,
                            data: { message }
                        }
                        socket.send(JSON.stringify(response))
                        return
                    }
                    logger.info(
                        'New subscription to history socket channel: ' + channel
                    )

                    socket.send(HISTORY_SOCKET_RESPONSE_SUCCESS)
                }

                // Unsubscribe client, remove PubSub if empty, return error if doesn't exist
                if (action == 'unsubscribe') {
                    if (!this.channels.has(channel)) {
                        // Unsubscribing from a channel that does not exist
                        const response: HistorySocketResponse = {
                            error: true,
                            data: { message: 'Channel not found' }
                        }

                        socket.send(JSON.stringify(response))
                        logger.error(
                            'Unable to unsubscribe from channel, not found: ' +
                                channel
                        )
                        return
                    }

                    try {
                        this.channels.get(channel)?.unsubscribe(socket)
                    } catch (error) {
                        // Error unsubscribing from a channel
                        const { message } = error as Error
                        logger.error(message + ' to ' + channel)

                        const response: HistorySocketResponse = {
                            error: true,
                            data: { message }
                        }
                        socket.send(JSON.stringify(response))
                        return
                    }

                    logger.info(
                        'Unsubscribed from history socket channel: ' + channel
                    )

                    socket.send(HISTORY_SOCKET_RESPONSE_SUCCESS)

                    if (this.channels.get(channel)?.empty) {
                        this.channels.delete(channel)
                    }
                }
            })

            socket.on('close', () => {
                logger.info('Subscription to history socket closed')
            })
        })
    }

    /**
     * Publishes an instance of `ClickHistoryEntry` to all clients subscribed to
     * a channel
     * @param shortId Name of url to publish message to (channel id)
     * @param payload Click history data to publish
     */
    publish(shortId: string, payload: ClickHistoryEntry) {
        // If there is nobody subscribed, don't publish
        if (!this.channels.has(shortId)) return

        this.channels.get(shortId)?.publish(payload)
    }
}

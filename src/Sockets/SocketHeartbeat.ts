import { logger } from '../Logger'
import ws from 'ws'

/**
 * Payload exchanged between the client and server to establish a heartbeat.
 * Payload is always identical both sending and receiving.
 */
export interface SocketHeartbeatPayload {
    type: 'heartbeat'
}

/**
 * Pre-built constant instance of `SocketHeartbeatPayload` for convenience
 */
const HEARTBEAT_OBJECT: SocketHeartbeatPayload = { type: 'heartbeat' }
export const HEARTBEAT = JSON.stringify(HEARTBEAT_OBJECT)

/**
 * Establishes a heartbeat protocol between the client and server to ensure that
 * both ends of the connection are still alive. If the heartbeat fails, the
 * connection will be considered dead, and the protocol will execute
 * `onHeartbeatStop` and close.
 */
export class SocketHeartbeat {
    private heartbeatInterval?: NodeJS.Timeout
    private heartbeatThresholdTimeout?: NodeJS.Timeout

    /**
     * Called when a heartbeat is emitted from the server, should override to
     * listen to event.
     */
    onHeartbeat(): void {}

    /**
     * Called when a heartbeat is received from the client, should override to
     * listen to event.
     */
    onHeartbeatResponse(): void {}

    /**
     * Called when a heartbeat fails or `stopHeartbeat` is called, should
     * override to listen to event.
     */
    onHeartbeatStop(): void {}

    /**
     * Setup the heartbeat protocol on an open WebSocket connection
     * @param socket Established and open WebSocket connection
     * @param interval After how many seconds a heartbeat will be sent
     * @param threshold How many seconds to wait for a response from the client
     */
    constructor(
        private socket: ws,
        private readonly interval = 30,
        private readonly threshold = 5
    ) {
        if (threshold >= interval)
            throw new RangeError('`threshold` must be less than `interval`')

        this.socket.on('message', (raw) => {
            try {
                const payload = JSON.parse(raw.toString())
                if (payload?.type === 'heartbeat') {
                    this.handleHeartbeatResponse()
                }
            } catch (error) {
                logger.error(error)
            }
        })
    }

    /**
     * Emit a heartbeat message to client
     */
    private heartbeat = () => {
        this.onHeartbeat && this.onHeartbeat()

        this.socket.send(HEARTBEAT)
        this.heartbeatThresholdTimeout = setTimeout(() => {
            this.heartbeatThresholdTimeout &&
                clearTimeout(this.heartbeatThresholdTimeout)

            this.stopHeartbeat()
        }, this.threshold * 1000)
    }

    /**
     * Respond to response from client heartbeat
     */
    private handleHeartbeatResponse = () => {
        this.onHeartbeatResponse()

        this.heartbeatThresholdTimeout &&
            clearTimeout(this.heartbeatThresholdTimeout)
    }

    /**
     * Start emitting heartbeat messages to the client
     */
    startHeartbeat = () => {
        this.heartbeatInterval = setInterval(
            this.heartbeat,
            this.interval * 1000
        )
    }

    /**
     * Stop emitting heartbeat messages to the client and cleanup
     */
    stopHeartbeat = () => {
        this.onHeartbeatStop()

        this.heartbeatThresholdTimeout &&
            clearTimeout(this.heartbeatThresholdTimeout)
        this.heartbeatInterval && clearInterval(this.heartbeatInterval)
    }
}

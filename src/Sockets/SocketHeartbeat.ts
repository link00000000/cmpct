import { logger } from '../Logger'
import ws from 'ws'

export interface SocketHeartbeatPayload {
    type: 'heartbeat'
}

const HEARTBEAT_OBJECT: SocketHeartbeatPayload = { type: 'heartbeat' }
export const HEARTBEAT = JSON.stringify(HEARTBEAT_OBJECT)

export class SocketHeartbeat {
    private heartbeatInterval?: NodeJS.Timeout
    private heartbeatThresholdTimeout?: NodeJS.Timeout

    onHeartbeat(): void {}
    onHeartbeatResponse(): void {}
    onHeartbeatStop(): void {}

    constructor(
        private socket: ws,
        private readonly interval = 30,
        private readonly threshold = 5
    ) {
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

    private heartbeat = () => {
        this.onHeartbeat && this.onHeartbeat()

        this.socket.send(HEARTBEAT)
        this.heartbeatThresholdTimeout = setTimeout(() => {
            this.heartbeatThresholdTimeout &&
                clearTimeout(this.heartbeatThresholdTimeout)

            this.stopHeartbeat()
        }, this.threshold * 1000)
    }

    private handleHeartbeatResponse = () => {
        this.onHeartbeatResponse()

        this.heartbeatThresholdTimeout &&
            clearTimeout(this.heartbeatThresholdTimeout)
    }

    startHeartbeat = () => {
        this.heartbeatInterval = setInterval(
            this.heartbeat,
            this.interval * 1000
        )
    }

    stopHeartbeat = () => {
        this.onHeartbeatStop()

        this.heartbeatThresholdTimeout &&
            clearTimeout(this.heartbeatThresholdTimeout)
        this.heartbeatInterval && clearInterval(this.heartbeatInterval)
    }
}

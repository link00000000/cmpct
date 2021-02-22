import ws from 'ws'

/**
 * A publish subscribe pattern. Clients can subscribe to an event and the server
 * with publish an event. When an event is published, all clients subscribed
 * will receive the payload. A client can unsubscribe when the no longer with to
 * receive payloads.
 */
export class PubSub {
    private subscriptions = new Set<ws>()

    /**
     * Subscribe a WebSocket to the event
     * @param socket Connection subscribing to the event
     */
    subscribe(socket: ws) {
        if (this.subscriptions.has(socket)) {
            throw Error('Socket already subscribed')
        }

        this.subscriptions.add(socket)
    }

    /**
     * Unsubscribe a WebSocket from the event
     * @param socket Connection unsubscribing from the event
     */
    unsubscribe(socket: ws) {
        if (!this.subscriptions.has(socket)) {
            throw Error('Socket is not subscribed')
        }

        this.subscriptions.delete(socket)
    }

    /**
     * Broadcast a message to all subscribed clients
     * @param data Payload to send
     */
    publish(data: {} | string) {
        if (data instanceof String) {
            this.subscriptions.forEach((socket) => {
                socket.send(data)
            })
        } else {
            // If the payload is an object, we have to convert it to a string
            // before sending it
            this.subscriptions.forEach((socket) => {
                socket.send(JSON.stringify(data))
            })
        }
    }

    /**
     * If the `PubSub` is not subscribed to by any clients
     */
    get empty() {
        return this.subscriptions.size === 0
    }
}

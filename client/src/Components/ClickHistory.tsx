import { FunctionComponent, useEffect, useRef, useState } from 'react'
import type {
    ClickHistory as IClickHistory,
    ClickHistoryEntry as IClickHistoryEntry
} from '../../../src/ClickHistoryManager'
import {
    HistorySocketPayload,
    HistorySocketResponse
} from '../../../src/Sockets/HistorySocket'
import { ClickHistoryEntry } from './ClickHistoryEntry'

interface Props {
    channel: string
}

export const ClickHistory: FunctionComponent<Props> = (props) => {
    const socket = useRef<WebSocket>()

    // @TODO Fill initial array with fetched HTTP data
    const [clicks, setClicks] = useState<IClickHistory>([])

    useEffect(() => {
        console.log('start')
        socket.current = new WebSocket('ws://localhost:8080/api/history')

        socket.current.onopen = () => {
            console.log('socket opened')

            const handshake: HistorySocketPayload = {
                action: 'subscribe',
                channel: props.channel
            }
            socket.current?.send(JSON.stringify(handshake))
        }

        socket.current.onmessage = (message) => {
            const payload = JSON.parse(message.data) as HistorySocketResponse

            if (payload.type === 'error') {
                // @TODO Handle Errors
                console.error((payload.data as any).message)
            } else if (payload.type === 'message') {
                console.log(message)
            } else if (payload.type === 'data') {
                setClicks((clicks) => [
                    payload.data as IClickHistoryEntry,
                    ...clicks
                ])
            }
        }

        socket.current.onclose = () => {
            console.log('socket closed')
        }

        socket.current.onerror = (e) => {
            console.log(e)
        }

        return () => {
            console.log('closing connection')

            const handshake: HistorySocketPayload = {
                action: 'unsubscribe',
                channel: props.channel
            }
            socket.current?.send(JSON.stringify(handshake))
            socket.current?.close()
        }
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-black mt-8 mb-4 uppercase">
                {clicks.length} Total Click
                {clicks.length !== 1 ? 's' : ''}
            </h1>

            {clicks.map((click, index) => (
                <ClickHistoryEntry key={index} data={click} />
            ))}
        </div>
    )
}

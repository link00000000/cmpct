import { FunctionComponent } from 'react'
import { ClickHistory } from '../Components/ClickHistory'
import { Map } from '../Components/Map'
import { TextCopy } from '../Components/TextCopy'
import { Button } from '../Components/Button'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { Modal } from '../Components/Modal'
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import {
    ClickHistory as IClickHistory,
    ClickHistoryEntry as IClickHistoryEntry
} from '../../../src/ClickHistoryManager'
import {
    HistorySocketPayload,
    HistorySocketResponse
} from '../../../src/Sockets/HistorySocket'

interface RouteInfo {
    channel: string
}

type Props = RouteComponentProps<RouteInfo>

export const History: FunctionComponent<Props> = (props) => {
    const history = useHistory()

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

    const socket = useRef<WebSocket>()

    // @TODO Fill initial array with fetched HTTP data
    const [clicks, setClicks] = useState<IClickHistory>([])

    useEffect(() => {
        console.log('start')
        socket.current = new WebSocket(
            `ws://${window.location.host}/api/history`
        )

        socket.current.onopen = () => {
            console.log('socket opened')

            const handshake: HistorySocketPayload = {
                action: 'subscribe',
                channel: props.match.params.channel
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
                channel: props.match.params.channel
            }
            socket.current?.send(JSON.stringify(handshake))
            socket.current?.close()
        }
    }, [])

    const handleDeleteModalCancel = () => {
        setShowDeleteModal(false)
    }

    const handleDeleteModalConfirm = () => {
        setShowDeleteModal(false)

        // @TODO Handle delete with API
        history.push('/')
    }

    return (
        <div className="md:container mx-auto p-8 lg:max-w-3xl">
            <h1 className="text-4xl uppercase font-extrabold text-center mb-8">
                URL Hstry
            </h1>

            <Map
                markers={clicks
                    .filter((click) => click.coordinates)
                    .map(({ city, state, country, coordinates }) => {
                        const title = [city, state, country]
                            .filter((x) => x !== undefined)
                            .join(', ')

                        return {
                            title,
                            coordinates: coordinates ?? {
                                longitude: 0,
                                latitude: 0
                            }
                        }
                    })
                    .reverse()}
            />

            <TextCopy
                display={'@TODO cmpct.tk/someUrl'}
                value={'@TODO https://cmpct.tk/someUrl'}
            />

            <ClickHistory clicks={clicks} />

            <Button
                color="bg-red-500"
                onClick={() => {
                    setShowDeleteModal(true)
                }}
            >
                Delete CMPCT Link
            </Button>

            <Modal
                title="Delete CMPCT Link"
                confirmText="Delete CMPCT Link"
                show={showDeleteModal}
                onCancel={handleDeleteModalCancel}
                onSubmit={handleDeleteModalConfirm}
            >
                Are you sure you want to delete this link? This action cannot be
                undone!
            </Modal>
        </div>
    )
}

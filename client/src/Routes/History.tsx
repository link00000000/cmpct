import { FunctionComponent } from 'react'
import { ClickHistory } from '../Components/ClickHistory'
import { Map } from '../Components/Map'
import { TextCopy } from '../Components/TextCopy'
import { Button } from '../Components/Button'
import { Notification, NotificationType } from '../Components/Notification'
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
import axios from 'axios'
import {
    HistoryRequestBody,
    HistoryResponseBody
} from '../../../src/Routes/History'
import { Loader } from '../Components/Loader'
import { DeleteResponseBody } from '../../../src/Routes/Delete'

interface RouteInfo {
    historyId: string
}

type Props = RouteComponentProps<RouteInfo>

export const History: FunctionComponent<Props> = (props) => {
    const history = useHistory()

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

    const [deleteError, setDeleteError] = useState<string | null>(null)

    const socket = useRef<WebSocket>()

    const [clicks, setClicks] = useState<IClickHistory>([])
    const [shortId, setShortId] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const historyApiRequestBody: HistoryRequestBody = {
            historyId: props.match.params.historyId
        }

        axios
            .post<HistoryResponseBody>('/api/history', historyApiRequestBody)
            .then((response) => {
                if (response.data.error || !response.data.data) {
                    // If there was an error loading information about the link,
                    // redirect client back to home page
                    history.replace('/')
                    return
                }

                setShortId(response.data.data.shortId)
                setClicks(response.data.data.clickHistory)
                setLoading(false)
            })
            .catch((error) => {
                console.error(error)
                history.replace('/')
            })
    }, [])

    useEffect(() => {
        socket.current = new WebSocket(
            `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
                window.location.host
            }/api/history`
        )

        socket.current.onopen = () => {
            const handshake: HistorySocketPayload = {
                action: 'subscribe',
                channel: props.match.params.historyId
            }
            socket.current?.send(JSON.stringify(handshake))
        }

        socket.current.onmessage = (message) => {
            const payload = JSON.parse(message.data) as HistorySocketResponse

            if (payload.type === 'error') {
                const message = (payload.data as any).message
                setDeleteError(message)
                console.error(message)
            } else if (payload.type === 'message') {
                console.info(message)
            } else if (payload.type === 'data') {
                setClicks((clicks) => [
                    payload.data as IClickHistoryEntry,
                    ...clicks
                ])
            } else if (payload.type === 'heartbeat') {
                socket.current?.send(JSON.stringify({ type: 'heartbeat' }))
            }
        }

        socket.current.onerror = (error) => {
            console.error(error)
        }

        return () => {
            const handshake: HistorySocketPayload = {
                action: 'unsubscribe',
                channel: props.match.params.historyId
            }
            socket.current?.send(JSON.stringify(handshake))
            socket.current?.close()
        }
    }, [])

    const handleDeleteModalCancel = () => {
        setDeleteError(null)
        setShowDeleteModal(false)
    }

    const handleDeleteModalConfirm = () => {
        setShowDeleteModal(false)
        axios
            .delete<DeleteResponseBody>(`/api/${props.match.params.historyId}`)
            .then((response) => {
                if (response.data.error) {
                    setDeleteError(response.data.error)
                    return
                }
                history.push('/')
            })
            .catch((error) => {
                const errorMessage =
                    error instanceof Error ? error.message : error.toString()
                setDeleteError(errorMessage)
                console.error(errorMessage)
            })
    }

    return (
        <div className="md:container mx-auto p-8 lg:max-w-3xl">
            <Loader loading={loading}>
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
                    display={window.location.host + '/' + shortId}
                    value={
                        window.location.protocol +
                        '//' +
                        window.location.host +
                        '/' +
                        shortId
                    }
                />

                <ClickHistory clicks={clicks} loading={loading} />

                <Button
                    color="bg-red-500"
                    onClick={() => {
                        setShowDeleteModal(true)
                    }}
                >
                    Delete CMPCT Link
                </Button>
            </Loader>

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

            <Notification
                type={NotificationType.error}
                show={deleteError !== null}
                onClose={() => {
                    setDeleteError(null)
                }}
            >
                There was an error deleting cmpct link. {deleteError}
            </Notification>
        </div>
    )
}

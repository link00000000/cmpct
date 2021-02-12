import { FunctionComponent, useState } from 'react'
import { Button } from './Button'
import { TextInput } from './TextInput'
import axios from 'axios'
import { CreateResponse } from '../../../src/Routes/Create'
import { Notification, NotificationType } from './Notification'

export const ShortenerInput: FunctionComponent = () => {
    const [input, setInput] = useState<string>('')
    const [shortLink, setShortLink] = useState<string | null>(null)
    const [errorNotification, setErrorNotification] = useState<Error | null>(
        null
    )

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value)
    }

    const handleSubmit = async () => {
        const urlRegExpMatcher = RegExp(/^https?:\/\/.+\..+/)
        const regExpResult = input?.match(urlRegExpMatcher)

        console.log(regExpResult)

        if (!regExpResult || regExpResult.length === 0) {
            setErrorNotification(new Error('Input must be a valid URL'))
            return
        }

        try {
            const {
                data: { data, error }
            } = await axios.post<CreateResponse>('/api', {
                url: input
            })

            if (error) {
                throw error
            }

            if (!data) {
                throw new Error('Server responded with empty response')
            }

            setShortLink(window.location.origin + '/' + data.id)
        } catch (error) {
            setErrorNotification(error)
        }
    }

    return (
        <div className="flex flex-col place-items-center">
            <TextInput
                placeholder="paste://your.massive/url?right=here"
                value={input}
                onChange={handleChange}
                onEnter={handleSubmit}
            />
            <Button color="bg-yellow-300" onClick={handleSubmit}>
                cmpct it
            </Button>

            <Notification
                show={shortLink !== null}
                onClose={() => {
                    setShortLink(null)
                }}
            >
                <span>
                    Your shortened link is{' '}
                    <a href={shortLink as string}>{shortLink}</a>
                </span>
            </Notification>

            <Notification
                type={NotificationType.error}
                show={errorNotification !== null}
                onClose={() => {
                    setErrorNotification(null)
                }}
            >
                <span>{errorNotification?.message}</span>
            </Notification>
        </div>
    )
}

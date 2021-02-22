import { FunctionComponent, useState } from 'react'
import { TextInput } from './TextInput'
import { Button } from './Button'
import { Notification } from './Notification'

interface Props {
    display?: string
    value: string
    buttonText?: string
}

export const TextCopy: FunctionComponent<Props> = ({
    value,
    display = value,
    buttonText = 'Copy cmpct Link'
}) => {
    const [showNotification, setShowNotification] = useState<boolean>(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value)
        setShowNotification(true)
    }

    return (
        <>
            <div className="md:flex items-start">
                <TextInput value={display} disabled />
                <Button
                    className="w-full md:w-max md:ml-8"
                    onClick={copyToClipboard}
                >
                    {buttonText}
                </Button>
            </div>
            <Notification
                show={showNotification}
                onClose={() => setShowNotification(false)}
            >
                Link copied to clipboard!
            </Notification>
        </>
    )
}

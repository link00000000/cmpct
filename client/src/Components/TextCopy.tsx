import { FunctionComponent } from 'react'
import { TextInput } from './TextInput'
import { Button } from './Button'

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
    const copyToClipboard = () => {
        navigator.clipboard.writeText(value)
    }

    return (
        <div className="md:flex items-start">
            <TextInput value={display} disabled />
            <Button
                className="w-full md:w-max md:ml-8"
                onClick={copyToClipboard}
            >
                {buttonText}
            </Button>
        </div>
    )
}

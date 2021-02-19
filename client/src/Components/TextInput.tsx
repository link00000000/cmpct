import { FunctionComponent } from 'react'
import styles from './TextInput.module.css'

interface Props {
    placeholder: string
    value: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    onEnter?: () => void
}

export const TextInput: FunctionComponent<Props> = (props) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && props.onEnter) props.onEnter()
    }

    return (
        <input
            type="text"
            {...props}
            className={`focus:text-gray-800 text-gray-500 focus:outline-none px-6 py-4 border-black border-8 w-full mb-4 ${styles['text-input']}`}
            onKeyDown={handleKeyDown}
        />
    )
}

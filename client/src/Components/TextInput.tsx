import { FunctionComponent } from 'react'
import styles from './TextInput.module.css'

interface Props {
    placeholder: string
    value: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const TextInput: FunctionComponent<Props> = (props) => {
    return (
        <input
            type="text"
            {...props}
            className={`focus:text-gray-800 text-gray-500 focus:outline-none px-6 py-4 border-black border-8 w-full mb-4 ${styles['text-input']}`}
        />
    )
}

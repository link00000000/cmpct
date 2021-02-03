import { FunctionComponent } from 'react'
import styles from './Button.module.css'

interface Props {
    color?: string
}

export const Button: FunctionComponent<Props> = ({
    color = 'bg-white',
    children
}) => {
    return (
        <button className={`focus:outline-none ${styles['button']}`}>
            <div
                className={`px-6 py-4 uppercase font-extrabold border-black border-8 select-none ${color} ${styles['button__content']}`}
            >
                {children}
            </div>
        </button>
    )
}

import { FunctionComponent } from 'react'
import styles from './Button.module.css'

interface Props {
    color?: string
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const Button: FunctionComponent<Props> = ({
    color = 'bg-white',
    children,
    onClick
}) => {
    return (
        <button
            className={`focus:outline-none ${styles['button']}`}
            onClick={onClick}
        >
            <div
                className={`px-6 py-4 uppercase font-extrabold border-black border-8 select-none ${color} ${styles['button__content']}`}
            >
                {children}
            </div>
        </button>
    )
}

import { FunctionComponent, InputHTMLAttributes } from 'react'
import classNames from 'classnames'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    onEnter?: () => void
}

export const TextInput: FunctionComponent<Props> = ({ onEnter, ...props }) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onEnter) onEnter()
    }

    return (
        <input
            type="text"
            {...props}
            onKeyDown={handleKeyDown}
            className={classNames(
                'focus:text-gray-800',
                'text-gray-500',
                'focus:outline-none',
                'px-6',
                'py-4',
                'border-black',
                'border-8',
                'w-full',
                'mb-4',
                'shadow'
            )}
        />
    )
}

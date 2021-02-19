import { FunctionComponent } from 'react'
import classNames from 'classnames'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export const TextInput: FunctionComponent<Props> = (props) => {
    return (
        <input
            type="text"
            {...props}
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

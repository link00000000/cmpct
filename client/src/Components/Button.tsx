import { FunctionComponent } from 'react'
import classNames from 'classnames'

interface Props {
    color?: string
    className?: string
}

export const Button: FunctionComponent<Props> = ({
    color = 'bg-yellow-300',
    className = '',
    children
}) => {
    return (
        <button
            className={
                classNames('focus:outline-none', 'group') + ' ' + className
            }
        >
            <div
                className={classNames(
                    'px-6',
                    'py-4',
                    'uppercase',
                    'font-extrabold',
                    'border-black',
                    'border-8',
                    'select-none',
                    'shadow-dark',
                    'group-hover:shadow-hidden-dark',
                    'transition',
                    'transform',
                    'group-hover:translate-y-8px',
                    'group-hover:translate-x-8px',
                    'ease-expo',
                    'duration-200',
                    'min-w-max',
                    color
                )}
            >
                {children}
            </div>
        </button>
    )
}

import { FunctionComponent } from 'react'
import { Portal } from 'react-portal'
import { Button } from './Button'
import classNames from 'classnames'

interface Props {
    title: string
    show: boolean
    cancelText?: string
    confirmText?: string
    confirmColor?: string
    onCancel?: () => void
    onSubmit?: () => void
}

export const Modal: FunctionComponent<Props> = ({
    title,
    show,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    confirmColor = 'bg-red-500',
    onCancel,
    onSubmit,
    children
}) => {
    return (
        <Portal>
            <div
                className={classNames(
                    'fixed',
                    'left-0',
                    'top-0',
                    'w-full',
                    'h-full',
                    'bg-black',
                    'bg-opacity-50',
                    'flex',
                    'justify-center',
                    'items-center',
                    'transition-opacity',
                    'duration-500',
                    show ? 'opacity' : 'opacity-0',
                    show ? 'pointer-events-auto' : 'pointer-events-none'
                )}
            >
                <div
                    className={classNames(
                        'border-8',
                        'border-black',
                        'shadow',
                        'bg-white',
                        'p-4',
                        'm-4',
                        'transform',
                        'transition-transform',
                        show ? 'duration-300' : 'duration-200',
                        show ? 'ease-expo' : 'ease-in',
                        show ? 'scale-100' : 'scale-0'
                    )}
                >
                    <h1 className="text-2xl uppercase font-black">{title}</h1>
                    <div className="pt-4 pb-8">{children}</div>

                    <div className="flex justify-end">
                        <Button color="bg-white mr-4" onClick={onCancel}>
                            {cancelText}
                        </Button>
                        <Button color={confirmColor} onClick={onSubmit}>
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    )
}

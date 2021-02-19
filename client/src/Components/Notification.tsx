import { FunctionComponent, useEffect } from 'react'
import { useTimer } from '../Hooks/Timer'
import classNames from 'classnames'

export enum NotificationType {
    info,
    error,
    warning
}

interface Props {
    type?: NotificationType
    canDismiss?: boolean
    show?: boolean
    duration?: number
    autoDismiss?: boolean
    onClose?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const Notification: FunctionComponent<Props> = ({
    children,
    type = NotificationType.info,
    canDismiss = true,
    show = true,
    duration = 5000,
    autoDismiss = true,
    onClose
}) => {
    const colors = {
        [NotificationType.info]: 'bg-blue-600',
        [NotificationType.error]: 'bg-red-500',
        [NotificationType.warning]: 'bg-yellow-500'
    }

    const timer = useTimer(duration)

    useEffect(() => {
        // On timer end
        if (timer.isDone && onClose) {
            timer.reset()
            onClose()
        }
    }, [timer.isDone])

    useEffect(() => {
        // Start timer
        if (show && autoDismiss) {
            timer.reset()
            timer.start()
        }
    }, [show])

    const handleClose = () => {
        timer.reset()
        if (onClose) {
            onClose()
        }
    }

    return (
        <div
            className={classNames(
                'px-6',
                'py-4',
                'fixed',
                'w-full',
                'bottom-0',
                'left-0',
                'text-white',
                'font-bold',
                'text-lg',
                'text-center',
                colors[type]
            )}
            style={{
                transform: `translateY(${show ? '0' : '100%'})`,
                transition: 'transform 200ms'
            }}
        >
            <span>{children}</span>

            {/* Close button */}
            {canDismiss && (
                <button
                    className="w-5 absolute right-6 top-5"
                    onClick={handleClose}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}

            {/* Progress bar */}
            <div
                className={classNames(
                    'absolute',
                    'left-0',
                    'bottom-0',
                    'bg-black',
                    'opacity-50',
                    'h-8px',
                    timer.isRunning && 'transition-all',
                    'duration-1000',
                    'ease-linear'
                )}
                style={{
                    width: (timer.currentTime / (duration - 1000)) * 100 + '%'
                }}
            ></div>
        </div>
    )
}

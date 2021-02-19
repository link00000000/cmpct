import { FunctionComponent } from 'react'

export enum NotificationType {
    info,
    error,
    warning
}

interface Props {
    type?: NotificationType
    canDismiss?: boolean
    show?: boolean
    onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const Notification: FunctionComponent<Props> = ({
    children,
    type = NotificationType.info,
    canDismiss = true,
    show = true,
    onClose
}) => {
    const colors = {
        [NotificationType.info]: 'bg-blue-600',
        [NotificationType.error]: 'bg-red-500',
        [NotificationType.warning]: 'bg-yellow-500'
    }

    return (
        <div
            className={`px-6 py-4 fixed w-full bottom-0 left-0 ${colors[type]} text-white font-sans font-bold text-lg text-center`}
            style={{
                transform: `translateY(${show ? '0' : '100%'})`,
                transition: 'transform 200ms'
            }}
        >
            <span>{children}</span>

            {canDismiss && (
                <button
                    className="w-5 absolute right-6 top-5"
                    onClick={onClose}
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
        </div>
    )
}

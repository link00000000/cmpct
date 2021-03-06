import classNames from 'classnames'
import { FunctionComponent } from 'react'
import { ReactComponent as LoaderIcon } from './Loader.svg'

interface Props {
    loading: boolean
}

export const Loader: FunctionComponent<Props> = ({ loading, children }) => {
    return (
        <div>
            <LoaderIcon
                fill="rgb(252, 211, 77)"
                stroke="#000000"
                strokeWidth="8px"
                // className="fixed left-1/2 top-1/2 z-999998 transform -translate-x-1/2 -translate-y-1/2 transition-opacity"
                className={classNames(
                    'fixed',
                    'left-1/2',
                    'top-1/2',
                    'z-999998',
                    'transform',
                    '-translate-x-1/2',
                    '-translate-y-1/2',
                    'transition-opacity',
                    'duration-300',
                    'pointer-events-none',
                    loading ? 'opacity-100' : 'opacity-0'
                )}
            />
            <div
                className={classNames(
                    'transition-opacity',
                    'duration-300',
                    loading ? 'opacity-50' : 'opacity-100',
                    loading && 'pointer-events-none',
                    loading && 'select-none',
                    loading && 'overflow-hidden'
                )}
            >
                {children}
            </div>
        </div>
    )
}

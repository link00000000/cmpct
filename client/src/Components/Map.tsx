import { FunctionComponent } from 'react'
import classNames from 'classnames'

export const Map: FunctionComponent = () => {
    return (
        <div
            className={classNames(
                'border-black',
                'border-8',
                'shadow',
                'relative',
                'cursor-move',
                'mb-8'
            )}
        >
            {/*eslint-disable-next-line jsx-a11y/alt-text*/}
            <img
                className="w-full object-fill"
                src="https://www.vertical-leap.uk/wp-content/uploads/2017/11/map-1400x800.jpg"
            />
            <span className="select-none absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-red-500">
                THIS IS A PLACEHOLDER IMAGE
            </span>
        </div>
    )
}

import { FunctionComponent } from 'react'
import { ClickHistoryEntry as IClickHistoryEntry } from '../../../src/ClickHistoryManager'
import classNames from 'classnames'
import { DateTime } from 'luxon'

interface Props {
    data: IClickHistoryEntry
}

export const ClickHistoryEntry: FunctionComponent<Props> = ({ data }) => {
    const title = [data.city, data.state, data.country]
        .filter((x) => x !== undefined)
        .join(', ')

    const formatUTCOffset = (offset: number) => {
        const isNegative = offset < 0

        const absOffset = Math.abs(offset)
        const minutes = String(Math.abs(absOffset % 1) * 60).padStart(2, '0')
        const hours = String(Math.trunc(absOffset)).padStart(2, '0')

        return `UTC${isNegative ? '-' : '+'}${hours}:${minutes}`
    }

    return (
        <div>
            <h2 className="text-lg">
                <span className="font-black uppercase">{title}</span>
                <span className="float-right">
                    {DateTime.fromMillis(data.time).toFormat('DD @ t')}
                </span>
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 mt-4">
                <TableEntry label="IP" value={data.ip} />
                <TableEntry
                    label="Longitude / Latitude"
                    value={
                        data.coordinates &&
                        `${data.coordinates.longitude} / ${data.coordinates.latitude}`
                    }
                />
                <TableEntry label="Provider" value={data.provider} />
                <TableEntry
                    label="Display Dimensions"
                    value={
                        data.displayDimensions &&
                        `${data.displayDimensions.width}x${data.displayDimensions.height}`
                    }
                />
                <TableEntry label="Browser" value={data.browser} />
                <TableEntry
                    label="System Volume"
                    value={data.volume?.toString()}
                />
                <TableEntry label="Operating System" value={data.os} />
                <TableEntry
                    label="Time Zone"
                    value={
                        data.timezone &&
                        `${data.timezone.offsetNameShort} (${formatUTCOffset(
                            data.timezone.utcOffset
                        )})`
                    }
                />
            </ul>
            <hr className="my-8"></hr>
        </div>
    )
}

interface ITableEntry {
    label: string
    value?: string
}

const TableEntry: FunctionComponent<ITableEntry> = ({ label, value }) => {
    return (
        <li>
            <span className="font-bold">{label}</span>
            <span
                className={classNames(
                    value === undefined && 'italic',
                    'float-right'
                )}
            >
                {value !== undefined ? value : 'unknown'}
            </span>
        </li>
    )
}

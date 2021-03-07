import { forwardRef, FunctionComponent } from 'react'
import { ClickHistoryEntry as IClickHistoryEntry } from '../../../src/ClickHistoryManager'
import { DateTime } from 'luxon'
import {
    countries as COUNTRY_LIST,
    languagesAll as LANGUAGE_LIST
} from 'countries-list'
import { FlagIcon } from './FlagIcon'

interface Props {
    data: IClickHistoryEntry
}

const COORDINATE_PRECISION = 3

export const ClickHistoryEntry = forwardRef<HTMLDivElement, Props>(
    ({ data }, ref) => {
        const formatUTCOffset = (offset: number) => {
            console.log(offset)
            const isNegative = offset < 0

            const absOffset = Math.abs(offset)
            const minutes = String(Math.abs(absOffset % 1) * 60).padStart(
                2,
                '0'
            )
            const hours = String(Math.trunc(absOffset / 60)).padStart(2, '0')

            return `UTC${isNegative ? '-' : '+'}${hours}:${minutes}`
        }

        /**
         * Convert ISO standardized language codes to a human readable format
         *
         * Code must be in format of <language code>-<country code>
         * ex. en-US
         *
         * See:
         * - ISO 3116-1 alpha-2: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
         * - ISO 639-2: https://en.wikipedia.org/wiki/ISO_639-2
         *
         * @param code ISO language localization code specified by ISO 3116-1 alpha-2 and ISO 639-2
         */
        const formatLanguageCode = (code: string) => {
            return LANGUAGE_LIST[
                code.toLowerCase() as keyof typeof LANGUAGE_LIST
            ]?.name
        }

        const formatCountryCode = (code: string) => {
            return COUNTRY_LIST[code.toUpperCase() as keyof typeof COUNTRY_LIST]
                ?.name
        }

        const title = [
            data.city,
            data.state,
            data.country && formatCountryCode(data.country)
        ]
            .filter((x) => x !== undefined)
            .join(', ')

        return (
            <div ref={ref}>
                <h2 className="text-lg">
                    <span className="font-black uppercase">
                        {data.country && (
                            <FlagIcon code={data.country?.toLowerCase()} />
                        )}{' '}
                        {title}
                    </span>
                    <span className="md:float-right block">
                        {DateTime.fromMillis(data.time).toFormat('DD @ t')}
                    </span>
                </h2>
                <ul className="grid md:grid-cols-2 gap-x-4 mt-4">
                    <TableEntry label="IP">{data.ip}</TableEntry>
                    <TableEntry label="Longitude / Latitude">
                        {data.coordinates &&
                            `${parseFloat(
                                data.coordinates.longitude.toFixed(
                                    COORDINATE_PRECISION
                                )
                            ).toString()} / ${parseFloat(
                                data.coordinates.latitude.toFixed(
                                    COORDINATE_PRECISION
                                )
                            ).toString()}`}
                    </TableEntry>
                    <TableEntry label="Provider">{data.provider}</TableEntry>
                    <TableEntry label="Display Dimensions">
                        {data.displayDimensions &&
                            `${data.displayDimensions.width}x${data.displayDimensions.height}`}
                    </TableEntry>
                    <TableEntry label="Browser">{data.browser}</TableEntry>
                    <TableEntry label="System Language">
                        {data.language &&
                            formatLanguageCode(data.language.split('-')[0])}
                    </TableEntry>
                    <TableEntry label="Operating System">{data.os}</TableEntry>
                    <TableEntry label="Time Zone">
                        {data.timezone &&
                            `${
                                data.timezone.offsetNameShort
                            } (${formatUTCOffset(data.timezone.utcOffset)})`}
                    </TableEntry>
                </ul>
                <hr className="my-8"></hr>
            </div>
        )
    }
)

interface ITableEntry {
    label: string
}

const TableEntry: FunctionComponent<ITableEntry> = ({ label, children }) => {
    return (
        <li>
            <span className="font-bold">{label}</span>

            {children ? (
                <span className={'float-right'}>{children}</span>
            ) : (
                <span className={'float-right italic'}>unknown</span>
            )}
        </li>
    )
}

import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { ClickHistoryEntry } from './ClickHistoryEntry'
import { ClickHistory as IClickHistory } from '../../../src/ClickHistoryManager'

interface Props {
    clicks: IClickHistory
}

export const ClickHistory: FunctionComponent<Props> = ({ clicks }) => {
    return (
        <div>
            <h1 className="text-2xl font-black mt-8 mb-4 uppercase">
                {clicks.length} Total Click
                {clicks.length !== 1 ? 's' : ''}
            </h1>

            {clicks.map((click, index) => (
                <ClickHistoryEntry key={index} data={click} />
            ))}
        </div>
    )
}

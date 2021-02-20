import { DateTime } from 'luxon'
import { FunctionComponent, useState } from 'react'
import type { ClickHistory as IClickHistory } from '../../../src/ClickHistoryManager'
import { ClickHistoryEntry } from './ClickHistoryEntry'

export const ClickHistory: FunctionComponent = () => {
    const val = {
        time: new Date().getTime(),
        city: 'Akron',
        state: 'Ohio',
        country: 'United States',
        ip: '75.185.171.56',
        timezone: {
            utcOffset: DateTime.now().offset / 60,
            offsetNameLong: DateTime.now().offsetNameLong,
            offsetNameShort: DateTime.now().offsetNameShort
        }
    }

    const vals = []
    for (let i = 0; i < 25; ++i) {
        vals.push(val)
    }

    const [clicks, setClicks] = useState<IClickHistory>(vals)

    return (
        <div>
            <h1 className="text-2xl font-black mt-8 mb-4 uppercase">
                {clicks.length} Total Click{clicks.length !== 1 ? 's' : ''}
            </h1>

            {clicks.map((click, index) => (
                <ClickHistoryEntry key={index} data={click} />
            ))}
        </div>
    )
}

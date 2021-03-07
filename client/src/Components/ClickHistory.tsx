import { FunctionComponent } from 'react'
import { ClickHistoryEntry } from './ClickHistoryEntry'
import { ClickHistory as IClickHistory } from '../../../src/ClickHistoryManager'
import FlipMove from 'react-flip-move'

interface Props {
    clicks: IClickHistory
    loading: boolean
}

export const ClickHistory: FunctionComponent<Props> = ({ clicks, loading }) => {
    return (
        <div>
            <h1 className="text-2xl font-black mt-8 mb-4 uppercase">
                {clicks.length} Total Click
                {clicks.length !== 1 ? 's' : ''}
            </h1>

            <FlipMove
                enterAnimation={loading ? 'none' : 'elevator'}
                easing="cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            >
                {clicks.map((click, index) => (
                    <ClickHistoryEntry
                        key={clicks.length - index - 1}
                        data={click}
                    />
                ))}
            </FlipMove>
        </div>
    )
}

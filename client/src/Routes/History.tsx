import { FunctionComponent } from 'react'
import { ClickHistory } from '../Components/ClickHistory'
import { Map } from '../Components/Map'
import { TextCopy } from '../Components/TextCopy'

export const History: FunctionComponent = () => {
    return (
        <div className="md:container mx-auto p-8 lg:max-w-3xl">
            <h1 className="text-4xl uppercase font-extrabold text-center mb-8">
                URL HSTRY
            </h1>

            <Map />

            <TextCopy
                display={'@TODO cmpct.tk/someUrl'}
                value={'@TODO https://cmpct.tk/someUrl'}
            />

            <ClickHistory />
        </div>
    )
}

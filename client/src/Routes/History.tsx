import { FunctionComponent } from 'react'
import { ClickHistory } from '../Components/ClickHistory'
import { Map } from '../Components/Map'
import { TextCopy } from '../Components/TextCopy'
import { Button } from '../Components/Button'
import { useHistory } from 'react-router-dom'

export const History: FunctionComponent = () => {
    const history = useHistory()

    const handleDelete = () => {
        // @TODO Handle delete with API
        history.push('/')
    }

    return (
        <div className="md:container mx-auto p-8 lg:max-w-3xl">
            <h1 className="text-4xl uppercase font-extrabold text-center mb-8">
                URL Hstry
            </h1>

            <Map />

            <TextCopy
                display={'@TODO cmpct.tk/someUrl'}
                value={'@TODO https://cmpct.tk/someUrl'}
            />

            <ClickHistory />

            <Button color="bg-red-500" onClick={handleDelete}>
                Delete CMPCT Link
            </Button>
        </div>
    )
}
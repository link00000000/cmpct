import { FunctionComponent } from 'react'
import { ShortenerInput } from '../Components/ShortenerInput'

export const Home: FunctionComponent = () => {
    return (
        <div className="flex flex-col min-h-screen place-content-center w-10/12 m-auto max-w-2xl">
            <h1 className="text-4xl uppercase font-extrabold text-center mb-8">
                cmpct - A URL Shrtnr
            </h1>
            <ShortenerInput />
        </div>
    )
}

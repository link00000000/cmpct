import { FunctionComponent } from 'react'
import { Button } from './Button'

export const ShortenerInput: FunctionComponent = () => {
    return (
        <div className='flex flex-col place-items-center'>
            <Button>cmpct it</Button>
            {/* <input
                type='url'
                placeholder='https://your.enormous/url'
                className='p-4 text-gray-600 focus:outline-none w-full shadow-offset-black'
            />
            <button className='py-2 px-4 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700 max-w-max'>
                cmpct it!
            </button> */}
        </div>
    )
}

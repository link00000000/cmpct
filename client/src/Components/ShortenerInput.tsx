import { FunctionComponent } from 'react'
import { Button } from './Button'
import { TextInput } from './TextInput'

export const ShortenerInput: FunctionComponent = () => {
    return (
        <div className="flex flex-col place-items-center">
            <TextInput placeholder="paste://your.massive/url?right=here" />
            <Button color="bg-yellow-300">cmpct it</Button>
        </div>
    )
}

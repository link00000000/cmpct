import { FunctionComponent, useEffect } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import {
    RedirectRequestBody,
    RedirectResponseBody
} from '../../../src/Routes/Redirect'
import axios from 'axios'

interface RouteInfo {
    shortUrl: string
}

type Props = RouteComponentProps<RouteInfo>

export const Redirect: FunctionComponent<Props> = (props) => {
    const history = useHistory()

    const API_ENDPOINT = '/api/' + props.match.params.shortUrl

    const collectedData: RedirectRequestBody = {
        platform: window.navigator.platform,
        displayDimensions: {
            width: window.screen.width,
            height: window.screen.height
        },
        language: window.navigator.language
    }

    const handleError = (error: Error) => {
        console.log(error)
        history.replace('/')
    }

    useEffect(() => {
        ;(async () => {
            try {
                const {
                    data: response
                } = await axios.put<RedirectResponseBody>(
                    API_ENDPOINT,
                    collectedData
                )

                if (response.error) {
                    return handleError(new Error(response.error))
                }

                if (!response.data) {
                    return handleError(
                        new Error('Empty data response from server')
                    )
                }

                // window.location.href = response.data.targetUrl
            } catch (error) {
                handleError(error)
            }
        })()
    }, [])

    return <></>
}

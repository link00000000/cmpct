import { FunctionComponent, useEffect } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { RedirectResponseBody } from '../../../src/Routes/Redirect'
import axios from 'axios'

interface RouteInfo {
    shortUrl: string
}

type Props = RouteComponentProps<RouteInfo>

export const Redirect: FunctionComponent<Props> = (props) => {
    const history = useHistory()

    const handleError = (error: Error) => {
        console.log(error)
        history.replace('/')
    }

    useEffect(() => {
        axios
            .get<RedirectResponseBody>('/api/' + props.match.params.shortUrl)
            .then(({ data: response }) => {
                if (response.error) {
                    return handleError(new Error(response.error))
                }

                if (!response.data) {
                    return handleError(
                        new Error('Empty data response from server')
                    )
                }

                window.location.href = response.data.targetUrl
            })
            .catch((error) => {
                handleError(error)
            })
    }, [])

    return <></>
}

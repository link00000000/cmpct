import { FunctionComponent } from 'react'
import { RouteComponentProps, RouteProps, useLocation } from 'react-router-dom'

interface RouteInfo {
    shortUrl: string
}

type Props = RouteComponentProps<RouteInfo>

export const Redirect: FunctionComponent<Props> = (props) => {
    return <h1>{props.match.params.shortUrl}</h1>
}

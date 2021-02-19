/**
 * @NOTE: This is not the homepage, this is the main file that handles
 * all client routing
 */

import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Home } from './Home'
import { Redirect } from './Redirect'
import { _404 } from './_404'

const Routes = (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/:shortUrl" exact component={Redirect} />
            <Route path="*" component={_404} />
        </Switch>
    </BrowserRouter>
)

export default Routes

/**
 * @NOTE: This is not the homepage, this is the main file that handles
 * all client routing
 */

import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Home } from './Home'
import { _404 } from './_404'

const Routes = (
    <BrowserRouter>
        <Switch>
            <Route path='/' exact>
                <Home />
            </Route>
            <Route path='*'>
                {/*eslint-disable-next-line react/jsx-pascal-case*/}
                <_404 />
            </Route>
        </Switch>
    </BrowserRouter>
)

export default Routes

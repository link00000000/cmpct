/**
 * @NOTE: This is not the homepage, this is the main file that handles
 * all client routing
 */

import { BrowserRouter, Route } from 'react-router-dom'
import { Home } from './Home'

const Routes = (
    <BrowserRouter>
        <Route path='/' exact>
            <Home />
        </Route>
    </BrowserRouter>
)

export default Routes

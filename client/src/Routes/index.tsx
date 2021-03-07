/**
 * @NOTE: This is not the homepage, this is the main file that handles
 * all client routing
 */

import { BrowserRouter, Route } from 'react-router-dom'
import { AnimatedSwitch } from 'react-router-transition'
import { Home } from './Home'
import { Redirect } from './Redirect'
import { _404 } from './_404'
import { History } from './History'
import './index.css'

const pageTransitions = {
    atEnter: { opacity: 0 },
    atLeave: { opacity: 0 },
    atActive: { opacity: 1 }
}

const Routes = (
    <BrowserRouter>
        <AnimatedSwitch {...pageTransitions} className="router-switch">
            <Route path="/" exact component={Home} />
            <Route path="/history/:historyId" exact component={History} />
            <Route path="/:shortUrl" exact component={Redirect} />
            <Route path="*" component={_404} />
        </AnimatedSwitch>
    </BrowserRouter>
)

export default Routes

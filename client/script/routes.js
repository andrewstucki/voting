
import React from 'react'
import { Route } from 'react-router'
import HelloPage from './containers/hello-page'
import App from './containers/app'

export default (
  <Route path="/" component={App}>
    <Route path='/users' component={HelloPage} />
  </Route>
)

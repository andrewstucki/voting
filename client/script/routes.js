
import React from 'react'
import { Route } from 'react-router'

import App from './containers/app'
import UsersPage from './containers/users-page'
import UserPage from './containers/user-page'
import PollsPage from './containers/polls-page'
import PollPage from './containers/poll-page'
import LoginPage from './containers/login-page'
import SignupPage from './containers/signup-page'
import AdminProfilePage from './containers/admin-profile-page'
import AdminEditPage from './containers/admin-edit-page'
import AdminNewPage from './containers/admin-new-page'

export default (
  <Route path='/' component={App}>
    <Route path='/login' component={LoginPage} />
    <Route path='/signup' component={SignupPage} />
    <Route path='/users' component={UsersPage} />
    <Route path='/polls' component={PollsPage} />
    <Route path='/users/:id' component={UserPage} />
    <Route path='/polls/:id' component={PollPage} />
    <Route path='/profile' component={AdminProfilePage} />
    <Route path='/edit/:id' component={AdminEditPage} />
    <Route path='/new' component={AdminNewPage} />
  </Route>
)

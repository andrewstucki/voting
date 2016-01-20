
import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './containers/app'
import UsersPage from './containers/users-page'
import UserPage from './containers/user-page'
import PollsPage from './containers/polls-page'
import PollPage from './containers/poll-page'
import HomePage from './containers/home-page'
import LoginPage from './containers/login-page'
import SignupPage from './containers/signup-page'
import AdminProfilePage from './containers/admin-profile-page'
import AdminEditPage from './containers/admin-edit-page'
import AdminNewPage from './containers/admin-new-page'

import { requireAuth, noAuth } from './components/auth'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={HomePage} />
    <Route path='/login' name='login' component={noAuth(LoginPage)} />
    <Route path='/signup' name='signup' component={noAuth(SignupPage)} />
    <Route path='/users' name='users' component={UsersPage} />
    <Route path='/polls' name='polls' component={PollsPage} />
    <Route path='/users/:id' name='user' component={UserPage} />
    <Route path='/polls/:id' name='poll' component={PollPage} />
    <Route path='/profile' name='admin-profile' component={requireAuth(AdminProfilePage)} />
    <Route path='/polls/:id/edit' name='admin-edit' component={requireAuth(AdminEditPage)} />
    <Route path='/new' name='admin-new' component={requireAuth(AdminNewPage)} />
  </Route>
)

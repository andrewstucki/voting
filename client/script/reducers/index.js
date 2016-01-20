import merge from 'lodash/object/merge'
import omit from 'lodash/object/omit'
import { routerStateReducer as router } from 'redux-router'
import { combineReducers } from 'redux'

import * as ActionTypes from '../actions'
import paginate from './paginate'

// Updates authentication state
function auth(state = { isAuthenticated: false, user: {} }, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_SUCCESS:
      const user = Object.values(action.response.user)[0]
      localStorage.setItem("token", user.token)
      return {
        isAuthenticated: true,
        user: user
      }
    case ActionTypes.LOGOUT_SUCCESS:
    case ActionTypes.LOGIN_FAILURE:
      localStorage.removeItem("token")
      return {
        isAuthenticated: false,
        user: {}
      }
    default:
      return state
  }
}

// Updates an entity cache in response to any action with response.entities.
function entities(state = { users: {}, polls: {} }, action) {
  if (action.response) {
    return merge({}, state, omit(action.response, 'nextPageUrl'))
  }

  return state
}

// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}

// Updates the pagination data for different actions.\
const pagination = combineReducers({
  users: paginate([
    ActionTypes.USERS_REQUEST,
    ActionTypes.USERS_SUCCESS,
    ActionTypes.USERS_FAILURE
  ], 'userPage'),
  polls: paginate([
    ActionTypes.POLLS_REQUEST,
    ActionTypes.POLLS_SUCCESS,
    ActionTypes.POLLS_FAILURE
  ], 'userPage')
})

const rootReducer = combineReducers({
  entities,
  pagination,
  auth,
  errorMessage,
  router
})

export default rootReducer

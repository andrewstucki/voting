import * as Constants from './constants'
import { api, handleError } from './api'

export function load(id) {
  return (dispatch, getState) => {
    if (getState().cache.users[id]) return null
    dispatch({ type: Constants.USER_REQUEST })
    return api(`/users/${id}`)
      .then(json => dispatch({ type: Constants.USER_SUCCESS, entity: 'users', value: json }))
      .catch(err => handleError(dispatch, Constants.USER_FAILURE, err))
  }
}

export function loadAll(forceUpdate = false) {
  return (dispatch, getState) => {
    if (getState().cache.usersLoaded && !forceUpdate) return null
    dispatch({ type: Constants.USERS_REQUEST })
    return api('/users')
      .then(json => dispatch({ type: Constants.USERS_SUCCESS, entity: 'users', value: json }))
      .catch(err => handleError(dispatch, Constants.USERS_FAILURE, err))
  }
}

export function add(record) {
  return { type: Constants.USER_ADD, entity: 'users', value: record }
}

export function remove(id) {
  return { type: Constants.USER_REMOVE, entity: 'users', value: id }
}

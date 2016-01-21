import * as Constants from './constants'
import { api, handleError } from './api'

export function updatePoll(poll) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.ADMIN_UPDATE_POLL_REQUEST })
    return api(`/admin/polls/${poll.id}`, { method: "patch", authentication: getState().auth.user.token }, poll)
      .then(json => dispatch({ type: Constants.ADMIN_UPDATE_POLL_SUCCESS, entity: 'polls', value: json }))
      .catch(err => handleError(dispatch, Constants.ADMIN_UPDATE_POLL_FAILURE, err))
  }
}

export function createPoll(poll, callback) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.ADMIN_CREATE_POLL_REQUEST })
    return api('/admin/polls', { method: "post", authentication: getState().auth.user.token }, poll)
      .then(json => {
        dispatch({ type: Constants.ADMIN_CREATE_POLL_SUCCESS, entity: 'polls', value: json })
        callback(json)
      })
      .catch(err => handleError(dispatch, Constants.ADMIN_CREATE_POLL_FAILURE, err))
  }
}

export function fetchPoll(id) {
  return (dispatch, getState) => {
    if (getState().session.polls[id]) return null
    dispatch({ type: Constants.ADMIN_POLL_REQUEST })
    return api(`/admin/polls/${id}`, { authentication: getState().auth.user.token })
      .then(json => dispatch({ type: Constants.ADMIN_POLL_SUCCESS, entity: 'polls', value: json }))
      .catch(err => dispatch({ type: Constants.ADMIN_POLL_FAILURE, error: err }))
  }
}

export function loadPolls(forceUpdate = false) {
  return (dispatch, getState) => {
    if (getState().session.pollsLoaded && !forceUpdate) return null
    dispatch({ type: Constants.ADMIN_POLLS_REQUEST })
    return api(`/admin/polls`, { authentication: getState().auth.user.token })
      .then(json => dispatch({ type: Constants.ADMIN_POLLS_SUCCESS, entity: 'polls', value: json }))
      .catch(err => handleError(dispatch, Constants.ADMIN_POLLS_FAILURE, err))
  }
}

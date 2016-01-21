import * as Constants from './constants'
import { api, handleError } from './api'

export function load(id) {
  return (dispatch, getState) => {
    if (getState().cache.polls[id]) return null
    dispatch({ type: Constants.POLL_REQUEST })
    return api(`/polls/${id}`)
      .then(json => dispatch({ type: Constants.POLL_SUCCESS, entity: 'polls', value: json }))
      .catch(err => handleError(dispatch, Constants.POLL_FAILURE, err))
  }
}

export function loadAll(forceUpdate = false) {
  return (dispatch, getState) => {
    if (getState().cache.pollsLoaded && !forceUpdate) return null
    dispatch({ type: Constants.POLLS_REQUEST })
    return api('/polls')
      .then(json => dispatch({ type: Constants.POLLS_SUCCESS, entity: 'polls', value: json }))
      .catch(err => handleError(dispatch, Constants.POLLS_FAILURE, err))
  }
}

export function vote(id, response) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.VOTE_REQUEST })
    return api(`/polls/${id}/vote`)
      .then(json => dispatch({ type: Constants.VOTE_SUCCESS, value: json }))
      .catch(err => handleError(dispatch, Constants.VOTE_FAILURE, err))
  }
}

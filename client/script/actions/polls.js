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

export function loadResults(id) {
  return (dispatch, getState) => {
    if (getState().cache.results.hasOwnProperty(id)) return null
    dispatch({ type: Constants.RESULTS_REQUEST })
    return api(`/polls/${id}/results`)
      .then(json => dispatch({ type: Constants.RESULTS_SUCCESS, entity: 'results', value: json }))
      .catch(err => handleError(dispatch, Constants.RESULTS_FAILURE, err))
  }
}

export function vote(id, response) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.VOTE_REQUEST })
    return api(`/polls/${id}/vote`, { method: "post" }, response)
      .then(json => dispatch({ type: Constants.VOTE_SUCCESS, value: json, id }))
      .catch(err => handleError(dispatch, Constants.VOTE_FAILURE, err))
  }
}

export function subscribe(id) {
  return { type: Constants.VOTE_SUBSCRIBE, id }
}

export function update(id, value, count) {
  return { type: Constants.VOTE_UPDATE, id, value, count }
}

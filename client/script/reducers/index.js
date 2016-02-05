import merge from 'lodash/object/merge'
import omit from 'lodash/object/omit'
import { routerStateReducer as router } from 'redux-router'
import { combineReducers } from 'redux'

import { constants, flash } from '../actions'

function handleCache(state, entity, value) {
  let flagLoaded = false
  let newEntities = {}
  if (Array.isArray(value)) {
    flagLoaded = true
    value.forEach(newEntity => {
      newEntities[newEntity.id] = newEntity
    })
  } else {
    newEntities[value.id] = value
  }
  const mergedEntities = Object.assign({}, state[entity], newEntities)
  let newState = {}
  if (flagLoaded) newState[`${entity}Loaded`] = true
  newState[entity] = mergedEntities
  return Object.assign({}, state, newState)
}

function removeCache(state, entity, value) {
  let newState = {}
  newState[entity] = omit(state[entity], value)
  return Object.assign({}, state, newState)
}

function session(state = { users: [], polls: [] }, action) {
  const { type, entity, value, id } = action
  switch (type) {
  case constants.LOGOUT_SUCCESS:
    return { users: [], polls: [] }
  case constants.ADMIN_CREATE_POLL_SUCCESS:
  case constants.ADMIN_POLL_SUCCESS:
  case constants.ADMIN_POLLS_SUCCESS:
  case constants.ADMIN_UPDATE_POLL_SUCCESS:
    return handleCache(state, entity, value)
  case constants.POLL_REMOVE:
  case constants.USER_REMOVE:
    return removeCache(state, entity, value)
  case constants.VOTE_SUCCESS:
    if (!state.polls[id]) return state
    let newPoll = {}
    newPoll[id] = Object.assign({}, state.polls[id], { responses: state.polls[id].responses + 1 })
    return Object.assign({}, state, { polls: Object.assign({}, state.polls, newPoll) })
  default:
    return state
  }

}
// Updates authentication state
function auth(state = { isAuthenticated: false, user: {} }, action) {
  const { type, value } = action
  switch (type) {
  case constants.LOGIN_SUCCESS:
    localStorage.setItem("token", value.token)
    return {
      isAuthenticated: true,
      user: value
    }
  case constants.LOGOUT_SUCCESS:
  case constants.LOGIN_FAILURE:
    localStorage.removeItem("token")
    return {
      isAuthenticated: false,
      user: {}
    }
  default:
    return state
  }
}

function cache(state = { users: {}, polls: {}, results: {}, pollsLoaded: false, usersLoaded: false }, action) {
  const { type, entity, value, id, count } = action
  switch(type) {
  case constants.POLL_SUCCESS:
  case constants.POLLS_SUCCESS:
  case constants.USER_SUCCESS:
  case constants.USERS_SUCCESS:
  case constants.RESULTS_SUCCESS:
  case constants.USER_ADD:
  case constants.POLL_ADD:
    return handleCache(state, entity, value)
  case constants.POLL_REMOVE:
  case constants.USER_REMOVE:
    return removeCache(state, entity, value)
  case constants.ADMIN_UPDATE_POLL_SUCCESS:
    if (value.published) return handleCache(state, entity, value)
    return state
  case constants.VOTE_UPDATE:
    let newCount = {}
    let mergeResult = {}
    newCount[value] = count
    mergeResult[id] = {id: id, answers: Object.assign({}, state.results[id].answers, newCount)}
    return Object.assign({}, state, { results: Object.assign({}, state.results, mergeResult) })
  case constants.VOTE_SUCCESS:
    let newPoll = {}
    newPoll[id] = Object.assign({}, state.polls[id], { responses: state.polls[id].responses + 1 })
    return Object.assign({}, state, { polls: Object.assign({}, state.polls, newPoll) })
  default:
    return state
  }
}

function message(state = null, action) {
  const { type, value, error } = action

  if (type === constants.RESET_MESSAGE || type === "@@reduxReactRouter/routerDidChange") { // reset every route change
    return null
  } else if (type === constants.SET_MESSAGE) {
    return value
  } else if (type === constants.SIGNUP_SUCCESS) {
    return {
      type: flash.SUCCESS,
      message: value.message
    }
  } else if (type === constants.VOTE_SUCCESS) {
    return {
      type: flash.SUCCESS,
      message: "Thanks for your answer!"
    }
  } else if (error) {
    return {
      type: flash.ERROR,
      message: error
    }
  }

  return state
}

function subscriptions(state = [], action) {
  if (action.type === constants.VOTE_SUBSCRIBE) {
    let newState = state.slice()
    newState.push(action.id)
    return newState
  }
  return state
}

export default combineReducers({
  cache,
  session,
  auth,
  message,
  subscriptions,
  router
})

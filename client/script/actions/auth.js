import * as Constants from './constants'
import { api, handleError } from './api'

export function login(email, password) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.LOGIN_REQUEST })
    return api(`/session`, { method: "post" }, { email, password })
      .then(json => dispatch({ type: Constants.LOGIN_SUCCESS, value: json }))
      .catch(err => handleError(dispatch, Constants.LOGIN_FAILURE, err))
  }
}

export function logout() {
  return (dispatch, getState) => {
    dispatch({ type: Constants.LOGOUT_REQUEST })
    return api(`/session`, { method: "delete", authentication: getState().auth.user.token })
      .then(json => dispatch({ type: Constants.LOGOUT_SUCCESS, value: json }))
      .catch(err => handleError(dispatch, Constants.LOGOUT_FAILURE, err))
  }
}

export function signup(email, password, confirmation) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.SIGNUP_REQUEST })
    return api('/signup', { method: "post" }, { email, password, confirmation })
      .then(json => dispatch({ type: Constants.SIGNUP_SUCCESS, value: json }))
      .catch(err => handleError(dispatch, Constants.SIGNUP_FAILURE, err))
  }
}

import { CALL_API } from '../middleware/api'

export const CREATE_POLL_REQUEST = 'CREATE_POLL_REQUEST'
export const CREATE_POLL_SUCCESS = 'CREATE_POLL_SUCCESS'
export const CREATE_POLL_FAILURE = 'CREATE_POLL_FAILURE'

export function createPoll(poll, callback) {
  return (dispatch, getState) => {
    return dispatch({
      [CALL_API]: {
        types: [ CREATE_POLL_REQUEST, CREATE_POLL_SUCCESS, CREATE_POLL_FAILURE ],
        model: 'polls',
        endpoint: '/admin/polls',
        method: 'post',
        params: poll,
        callback: callback
      }
    })
  }
}

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

// Logs out the user using the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
export function logout() {
  return (dispatch, getState) => {
    return dispatch({
      [CALL_API]: {
        types: [ LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE ],
        endpoint: '/session',
        method: 'delete'
      }
    })
  }
}

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

// Logs in the user to the application using the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
export function login(email, password) {
  return (dispatch, getState) => {
    return dispatch({
      [CALL_API]: {
        types: [ LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE ],
        model: 'user',
        endpoint: '/session',
        method: 'post',
        params: {
          email: email,
          password: password
        }
      }
    })
  }
}

export const SIGNUP_REQUEST = 'SIGNUP_REQUEST'
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS'
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE'

// Signs up the user to the application using the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
export function signup(email, password, confirmation) {
  return (dispatch, getState) => {
    return dispatch({
      [CALL_API]: {
        types: [ SIGNUP_REQUEST, SIGNUP_SUCCESS, SIGNUP_FAILURE ],
        endpoint: '/signup',
        method: 'post',
        params: {
          email: email,
          password: password,
          password_confirmation: confirmation
        }
      }
    })
  }
}

export const USER_REQUEST = 'USER_REQUEST'
export const USER_SUCCESS = 'USER_SUCCESS'
export const USER_FAILURE = 'USER_FAILURE'

// Fetches a single user from the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUser(id) {
  return {
    [CALL_API]: {
      types: [ USER_REQUEST, USER_SUCCESS, USER_FAILURE ],
      model: 'users',
      endpoint: `/users/${id}`
    }
  }
}

// Fetches a single user from the API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadUser(id, requiredFields = []) {
  return (dispatch, getState) => {
    const user = getState().entities.users[id]
    if (user && requiredFields.every(key => user.hasOwnProperty(key))) {
      return null
    }

    return dispatch(fetchUser(id))
  }
}

// Fetches a single poll from the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPoll(id) {
  return {
    [CALL_API]: {
      types: [ POLLS_REQUEST, POLLS_SUCCESS, POLLS_FAILURE ],
      model: 'polls',
      endpoint: `/polls/${id}`
    }
  }
}

// Fetches a single poll from the API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadPoll(id, requiredFields = []) {
  return (dispatch, getState) => {
    const poll = getState().entities.polls[id]
    if (poll && requiredFields.every(key => poll.hasOwnProperty(key))) {
      return null
    }

    return dispatch(fetchPoll(id))
  }
}

export const USERS_REQUEST = 'USERS_REQUEST'
export const USERS_SUCCESS = 'USERS_SUCCESS'
export const USERS_FAILURE = 'USERS_FAILURE'

// Fetches a page of users from the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUsers(nextPageUrl) {
  return {
    [CALL_API]: {
      types: [ USERS_REQUEST, USERS_SUCCESS, USERS_FAILURE ],
      endpoint: nextPageUrl,
      model: 'users'
    }
  }
}

// Fetches a page of users.
// Bails out if page is cached and user didn’t specifically request next page.
// Relies on Redux Thunk middleware.
export function loadUsers(nextPage) {
  return (dispatch, getState) => {
    const {
      nextPageUrl = `/users`,
      pageCount = 0
    } = getState().pagination.users || {}

    // if (pageCount > 0 && !nextPage) {
    //   return null
    // }

    return dispatch(fetchUsers(nextPageUrl || '/users'))
  }
}

export const POLLS_REQUEST = 'POLLS_REQUEST'
export const POLLS_SUCCESS = 'POLLS_SUCCESS'
export const POLLS_FAILURE = 'POLLS_FAILURE'

// Fetches a page of polls from the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPolls(nextPageUrl) {
  return {
    [CALL_API]: {
      types: [ POLLS_REQUEST, POLLS_SUCCESS, POLLS_FAILURE ],
      endpoint: nextPageUrl,
      model: 'polls'
    }
  }
}

// Fetches a page of polls.
// Bails out if page is cached and user didn’t specifically request next page.
// Relies on Redux Thunk middleware.
export function loadPolls(nextPage) {
  return (dispatch, getState) => {
    const {
      nextPageUrl = `/polls`,
      pageCount = 0
    } = getState().pagination.polls || {}

    // if (pageCount > 0 && !nextPage) {
    //   return null
    // }

    return dispatch(fetchPolls(nextPageUrl || '/polls'))
  }
}

export const MY_POLLS_REQUEST = 'MY_POLLS_REQUEST'
export const MY_POLLS_SUCCESS = 'MY_POLLS_SUCCESS'
export const MY_POLLS_FAILURE = 'MY_POLLS_FAILURE'

// Fetches the polls for the admin.
// Relies on Redux Thunk middleware.
export function loadMyPolls() {
  return (dispatch, getState) => {
    return dispatch({
      [CALL_API]: {
        types: [ MY_POLLS_REQUEST, MY_POLLS_SUCCESS, MY_POLLS_FAILURE ],
        endpoint: '/admin/polls',
        model: 'mypolls'
      }
    })
  }
}

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'

// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}

export function setErrorMessage({message: message, type: type}) {
  return {
    type: SET_ERROR_MESSAGE,
    payload: {
      message: message,
      type: type
    }
  }
}

export const VOTE_REQUEST = 'VOTE_REQUEST'
export const VOTE_SUCCESS = 'VOTE_SUCCESS'
export const VOTE_FAILURE = 'VOTE_FAILURE'

export function vote(poll, response, callback) {
  console.log(callback)
  return (dispatch, getState) => {
    console.log({
      [CALL_API]: {
        types: [ VOTE_REQUEST, VOTE_SUCCESS, VOTE_FAILURE ],
        endpoint: `/polls/${poll}/vote`,
        model: 'vote',
        method: 'post',
        callback: callback,
        params: response
      }
    })
    return dispatch({
      [CALL_API]: {
        types: [ VOTE_REQUEST, VOTE_SUCCESS, VOTE_FAILURE ],
        endpoint: `/polls/${poll}/vote`,
        model: 'vote',
        method: 'post',
        callback: callback,
        params: response
      }
    })
  }
}

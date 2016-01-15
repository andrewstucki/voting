import { CALL_API } from '../middleware/api'

export const USER_REQUEST = 'USER_REQUEST'
export const USER_SUCCESS = 'USER_SUCCESS'
export const USER_FAILURE = 'USER_FAILURE'

// Fetches the currently logged in user from the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchProfile() {
  return {
    [CALL_API]: {
      types: [ USER_REQUEST, USER_SUCCESS, USER_FAILURE ],
      model: 'users',
      endpoint: '/profile'
    }
  }
}

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

export const POLL_REQUEST = 'POLL_REQUEST'
export const POLL_SUCCESS = 'POLL_SUCCESS'
export const POLL_FAILURE = 'POLL_FAILURE'

// Fetches a single poll from the API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPoll(id) {
  return {
    [CALL_API]: {
      types: [ POLL_REQUEST, POLL_SUCCESS, POLL_FAILURE ],
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

    if (pageCount > 0 && !nextPage) {
      return null
    }

    return dispatch(fetchUsers(nextPageUrl))
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

    if (pageCount > 0 && !nextPage) {
      return null
    }

    return dispatch(fetchPolls(nextPageUrl))
  }
}


export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}

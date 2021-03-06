export const API_ROOT = (process.env.NODE_ENV === "production") ? process.env.API_URL || '/api/v1' : '/api/v1'

//Auth
export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'
export const SIGNUP_REQUEST = 'SIGNUP_REQUEST'
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS'
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE'

//Admin
export const ADMIN_POLL_REQUEST = 'ADMIN_POLL_REQUEST'
export const ADMIN_POLL_SUCCESS = 'ADMIN_POLL_SUCCESS'
export const ADMIN_POLL_FAILURE = 'ADMIN_POLL_FAILURE'
export const ADMIN_POLLS_REQUEST = 'ADMIN_POLLS_REQUEST'
export const ADMIN_POLLS_SUCCESS = 'ADMIN_POLLS_SUCCESS'
export const ADMIN_POLLS_FAILURE = 'ADMIN_POLLS_FAILURE'
export const ADMIN_CREATE_POLL_REQUEST = 'ADMIN_CREATE_POLL_REQUEST'
export const ADMIN_CREATE_POLL_SUCCESS = 'ADMIN_CREATE_POLL_SUCCESS'
export const ADMIN_CREATE_POLL_FAILURE = 'ADMIN_CREATE_POLL_FAILURE'
export const ADMIN_DELETE_POLL_REQUEST = 'ADMIN_DELETE_POLL_REQUEST'
export const ADMIN_DELETE_POLL_SUCCESS = 'ADMIN_DELETE_POLL_SUCCESS'
export const ADMIN_DELETE_POLL_FAILURE = 'ADMIN_DELETE_POLL_FAILURE'
export const ADMIN_UPDATE_POLL_REQUEST = 'ADMIN_UPDATE_POLL_REQUEST'
export const ADMIN_UPDATE_POLL_SUCCESS = 'ADMIN_UPDATE_POLL_SUCCESS'
export const ADMIN_UPDATE_POLL_FAILURE = 'ADMIN_UPDATE_POLL_FAILURE'

//User
export const USER_REQUEST = 'USER_REQUEST'
export const USER_SUCCESS = 'USER_SUCCESS'
export const USER_FAILURE = 'USER_FAILURE'
export const USER_ADD = 'USER_ADD'
export const USER_REMOVE = 'USER_REMOVE'
export const USERS_REQUEST = 'USERS_REQUEST'
export const USERS_SUCCESS = 'USERS_SUCCESS'
export const USERS_FAILURE = 'USERS_FAILURE'

//Poll
export const POLL_REQUEST = 'POLL_REQUEST'
export const POLL_SUCCESS = 'POLL_SUCCESS'
export const POLL_FAILURE = 'POLL_FAILURE'
export const POLL_ADD = 'POLL_ADD'
export const POLL_REMOVE = 'POLL_REMOVE'
export const POLLS_REQUEST = 'POLLS_REQUEST'
export const POLLS_SUCCESS = 'POLLS_SUCCESS'
export const POLLS_FAILURE = 'POLLS_FAILURE'
export const VOTE_REQUEST = 'VOTE_REQUEST'
export const VOTE_SUCCESS = 'VOTE_SUCCESS'
export const VOTE_FAILURE = 'VOTE_FAILURE'
export const VOTE_UPDATE = 'VOTE_UPDATE'
export const VOTE_SUBSCRIBE = 'VOTE_SUBSCRIBE'
export const RESULTS_REQUEST = 'RESULTS_REQUEST'
export const RESULTS_SUCCESS = 'RESULTS_SUCCESS'
export const RESULTS_FAILURE = 'RESULTS_FAILURE'

//Flash
export const RESET_MESSAGE = 'RESET_MESSAGE'
export const SET_MESSAGE = 'SET_MESSAGE'

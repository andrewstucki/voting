import { camelizeKeys } from 'humps'
import 'isomorphic-fetch'

// Extracts the next page from API response.
function getNextPageUrl(response) {
  const link = response.headers.get('link')
  if (!link) {
    return null
  }

  const nextLink = link.split(',').find(s => s.indexOf('rel="next"') > -1)
  if (!nextLink) {
    return null
  }

  return nextLink.split(';')[0].slice(1, -1)
}

const API_ROOT = (process.env.NODE_ENV === "production") ? process.env.API_URL || '/api/v1' : '/api/v1'

function normalize(data, model) {
  if (!model) return data
  let normalizedJson = {}
  let returnedJson = {}
  if (Array.isArray(data)) {
    data.forEach(json => (normalizedJson[json.id] = json))
  } else {
    normalizedJson[data.id] = data
  }
  returnedJson[model] = normalizedJson
  return returnedJson
}

// Fetches an API response and normalizes the result JSON.
export function callApi(endpoint, model, headers = {}, method = 'get', params = null) {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint
  const ajaxHeaders = Object.assign({}, headers, {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  })
  let payload = {
    method: method,
    headers: ajaxHeaders
  }

  if (params) {
    payload = Object.assign(payload, {body: JSON.stringify(params)})
  }
  return fetch(fullUrl, payload)
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json)
      }

      const camelizedJson = camelizeKeys(json)
      const nextPageUrl = getNextPageUrl(response)

      return Object.assign({},
        normalize(camelizedJson, model),
        { nextPageUrl }
      )
    })
}

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = Symbol('Call API')

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  console.log("api call " + action)
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action)
  }
  console.log("api call")

  let { endpoint } = callAPI
  const { model, types } = callAPI
  const { params, method, callback } = callAPI
  const state = store.getState()

  if (typeof endpoint === 'function') {
    endpoint = endpoint(state)
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (model && typeof model !== 'string') {
    throw new Error('Specify a string of the response model type.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }
  if (params && typeof params !== 'object') {
    throw new Error('Expected action params to be an object.')
  }
  if (method && typeof method !== 'string') {
    throw new Error('Expected action method to be a string.')
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  const [ requestType, successType, failureType ] = types
  next(actionWith({ type: requestType }))

  let authHeaders = {}
  if (state.auth.isAuthenticated) {
    authHeaders = {
      'X-Voting-Session': state.auth.user.token
    }
  }

  console.log("requesting " + endpoint)
  return callApi(endpoint, model, authHeaders, method, params).then(
    response => {
      if (callback && model) callback(response[model])
      next(actionWith({
        response,
        type: successType
      }))
    },
    err => {
      console.log(err)
      next(actionWith({
      type: failureType,
      error: err.error || 'Something bad happened'
    }))}
  )
}

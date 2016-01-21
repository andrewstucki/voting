import 'isomorphic-fetch'

import * as Constants from './constants'

export function handleError(dispatch, constant, error) {
  error.json().then(json => dispatch({ type: constant, error: json.message })).catch(() => dispatch({ type: constant, error: "JSON parser error" }))
}

export function api(endpoint, userParams = {}, body = null) {
  let params = Object.assign({}, { headers: {}, method: "get", authentication: null }, userParams)
  const fullUrl = Constants.API_ROOT + endpoint
  let ajaxHeaders = Object.assign({}, params.headers, {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  })
  if (params.authentication) {
    ajaxHeaders['X-Voting-Session'] = params.authentication
  }
  let payload = {
    method: params.method,
    headers: ajaxHeaders
  }
  if (body) {
    payload = Object.assign(payload, {body: JSON.stringify(params)})
  }
  return fetch(fullUrl, payload).then(response => response.json())
}

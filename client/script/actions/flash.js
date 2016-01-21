import * as Constants from './constants'

export const SUCCESS = "success"
export const ERROR = "danger"

export function setMessage(type, message) {
  return {
    type: Constants.SET_MESSAGE,
    value: {
      message: message,
      type: type
    }
  }
}

export function resetMessage() {
  return {
    type: Constants.RESET_MESSAGE
  }
}

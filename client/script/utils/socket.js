import difference from 'lodash/array/difference'

import { update } from '../actions/polls'

export default class Socket {
  constructor(url, store) {
    this.websocket = new WebSocket(`ws://${url}`, 'voting')
    this.store = store
    this.store.subscribe(this.storeUpdate.bind(this))
    this.subscriptions = []
    this.connected = false
    const self = this
    this.websocket.onmessage = event => self.handleMessage(JSON.parse(event.data))
    this.websocket.onopen = () => self.connected = true
    this.websocket.onclose = () => {
      self.connected = false
      self.subscriptions = []
    }
  }

  handleMessage(data) {
    console.log(data);
    console.log(data.type, data.id, this.subscriptions)
    if (data.type !== 'update' || this.subscriptions.indexOf(data.id) === -1) return
    console.log('blah')
    return this.store.dispatch(update(data.id, data.value, data.count))
  }

  storeUpdate() {
    if (this.connected) {
      const { subscriptions } = this.store.getState()
      const newSubscriptions = difference(subscriptions, this.subscriptions)
      for (let subscription of newSubscriptions) {
        this.subscriptions.push(subscription)
        this.websocket.send(JSON.stringify({
          type: 'subscribe',
          id: subscription
        }))
      }
    }
  }

  close() {
    this.websocket.close()
  }
}

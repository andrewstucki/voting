import difference from 'lodash/array/difference'

import { constants, polls, users } from '../actions'

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
    switch (data.type) {
    case 'update':
      if (this.subscriptions.indexOf(data.id) === -1) return
      return this.store.dispatch(polls.update(data.id, data.value, data.count))
    case 'add':
      switch(data.entity) {
        case 'polls':
          return this.store.dispatch(polls.add(data.record))
        case 'users':
          return this.store.dispatch(users.add(data.record))
      }
    case 'remove':
      switch(data.entity) {
        case 'polls':
          return this.store.dispatch(polls.remove(data.id))
        case 'users':
          return this.store.dispatch(polls.remove(data.id))
      }
    }
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

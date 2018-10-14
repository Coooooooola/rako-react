import Store from "rabbit-store"
import React from "react"

const $$value = Symbol ? Symbol('value') : '(value)-rabbit-2333'
const $$listeners = Symbol ? Symbol('listeners') : '(listeners)-rabbit-2334'

class Prop {
  constructor(store, mapper = (state, updater) => Object.assign({}, state, updater)) {
    if (!(store instanceof Store)) {
      throw new TypeError('Prop store: type is invalid -- expected a Store but got :' + (store == null ? store : typeof store) + '.')
    }
    if (typeof mapper !== 'function') {
      throw new TypeError('Prop mapper: type is invalid -- expected a function but got :' + (mapper == null ? mapper : typeof mapper) + '.')
    }
    const updater = store.getUpdaters()
    this[$$value] = mapper(store.getState(), updater)
    this[$$listeners] = []
    store.subscribe(state => {
      const value = mapper(state, updater)
      this[$$value] = value
      this[$$listeners].forEach(listener => listener(value))
    })
  }
}

function update(value) {
  this.value = Object.assign(this.value, value)
  this.instances.forEach(instance => instance.update())
}

function unsubscribe() {
  if (!this.isScheduledUnsubscribe) {
    this.isScheduledUnsubscribe = true
    requestIdleCallback(() => {
      this.instances = this.instances.filter(instance => !instance.isUnmounted)
      this.isScheduledUnsubscribe = false
    })
  }
}

Prop.assign = function (...props) {
  props.forEach(prop => {
    if (!(prop instanceof Prop)) {
      throw new TypeError('Prop.assign props: type is invalid -- expected a prop but got :' + (prop == null ? prop : typeof prop) + '.')
    }
  })
  const state = {
    value: Object.assign({}, ...props.map(prop => prop[$$value])),
    instances: [],
    isScheduledUnsubscribe: false,
    unsubscribe: null
  }
  state.unsubscribe = unsubscribe.bind(state)
  props.forEach(prop => prop[$$listeners].push(update.bind(state)))

  return function (Component) {
    if (typeof Component !== 'function') {
      throw new TypeError('Component: type is invalid -- expected a function or React.Component but got :' + (Component == null ? Component : typeof Component) + '.')
    }

    return class $Prop extends React.Component {
      constructor(_props) {
        super(_props)
        this.isUnmounted = false
        state.instances.push(this)
      }
      update() {
        if (!this.isUnmounted) {
          this.forceUpdate()
        }
      }
      componentWillUnmount() {
        this.isUnmounted = true
        state.unsubscribe()
      }
      render() {
        return React.createElement(Component, Object.assign({}, state.value, this.props))
      }
    }
  }
}

export default Prop

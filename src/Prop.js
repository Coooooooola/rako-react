import Store from "rabbit-store"
import React from "react"

const $$value = Symbol ? Symbol('value') : '(value)-rabbit-2333'
const $$listeners = Symbol ? Symbol('listeners') : '(value)-rabbit-2334'

class Prop {
  constructor(store, mapper = (state, updater) => Object.assign({}, state, updater)) {
    if (!(store instanceof Store)) {
      throw new TypeError('')
    }
    if (typeof mapper !== 'function') {
      throw new TypeError('')
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
  this.instances.forEach(instance => {
    instance.isUpToDate = false
  })
  this.instances.forEach(instance => instance.update())
}

function unsubscribe() {
  if (!this.isScheduledUnsubscribe) {
    this.isScheduledUnsubscribe = true
    requestAnimationFrame(() => {
      this.instances = this.instances.filter(instance => !instance.isUnmounted)
      this.isScheduledUnsubscribe = false
    })
  }
}

Prop.merge = function (...props) {
  if (!props.every(prop => prop instanceof Prop)) {
    throw new TypeError('')
  }
  const state = {
    value: Object.assign({}, ...props.map(prop => prop[$$value])),
    instances: [],
    isScheduledUnsubscribe: false,
    unsubscribe: null
  }
  state.unsubscribe = unsubscribe.bind(state)
  props.forEach(prop => prop[$$listeners].push(update.bind(state)))

  return function (Component, pure = true) {
    if (typeof Component !== 'function') {
      throw new TypeError('')
    }
    if (typeof pure !== 'boolean' && typeof pure !== 'function') {
      throw new TypeError('')
    }
    
    return class $Prop extends React.Component {
      constructor(_props) {
        super(_props)
        this.isUnmounted = false
        this.isUpToDate = true
        state.instances.push(this)
      }
      update() {
        if (!this.isUnmounted && !this.isUpToDate) {
          this.forceUpdate()
        }
      }
      componentWillUnmount() {
        this.isUnmounted = true
        state.unsubscribe()
      }
      render() {
        this.isUpToDate = true
        return React.createElement(Component, Object.assign({}, state.value, this.props))
      }
    }
  }
}

export default Prop

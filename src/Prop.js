import Store from "rako"
import React from "react"

const $$recalcs = Symbol('recalcs')
const $$renderer = Symbol('renderer')
const $$value = Symbol('value')

class Renderer {
  constructor(store) {
    if (!(store instanceof Store)) {
      throw new TypeError('Expected store to be an instance of Store.')
    }
    this.listeners = []
    this.instances = []
    store.subscribe(this.render.bind(this))
  }
  subscribe(listener) {
    this.listeners.push(listener)
  }
  connect(instance) {
    this.instances.push(instance)
  }
  render(state) {
    this.listeners.forEach(listener => listener(state))

    this.instances.forEach(instance => {
      instance.isExpire = true
    })
    this.instances.forEach(instance => instance.update())
  }
}
const disconnector = {
  renderers: [],
  isScheduled: false,
  disconnect(...renderers) {
    this.renderers.push(...renderers)
    if (!this.isScheduled) {
      this.isScheduled = true
      const clear = () => {
        this.renderers.forEach(renderer => {
          renderer.instances = renderer.instances.filter(instance => !instance.isUnmount)
        })
        this.renderers.length = 0
        this.isScheduled = false
      }
      if (requestIdleCallback) {
        requestIdleCallback(clear)
      } else {
        setTimeout(clear, 100);
      }
    }
  }
}
Renderer.disconnect = disconnector.disconnect

function createRenderer(store) {
  if (createRenderer.map.has(store)) {
    return createRenderer.map.get(store)
  }
  const renderer = new Renderer(store)
  createRenderer.map.set(store, renderer)
  return renderer
}
createRenderer.map = new Map()

class Prop {
  constructor(store, mapper = (state, updater) => Object.assign({}, state, updater)) {
    this[$$renderer] = createRenderer(store)
    if (typeof mapper !== 'function') {
      throw new TypeError('Expected mapper to be a function.')
    }
    const updater = store.getUpdater()
    this[$$value] = mapper(store.getState(), updater)
    this[$$recalcs] = []
    this[$$renderer].subscribe(state => {
      this[$$value] = mapper(state, updater)
      this[$$recalcs].forEach(recalc => recalc(this[$$value]))
    })
  }
}

Prop.assign = function (...values) {
  const props = []
  const objects = []
  values.forEach(value => {
    if (value instanceof Prop) {
      props.push(value)
    } else if (typeof value === 'object') {
      objects.push(value)
    } else {
      throw new TypeError('Expected values to be an object or an instance of Prop.')
    }
  })

  const value = Object.assign({}, ...objects, ...props.map(prop => prop[$$value]))
  const recalc = subValue => Object.assign(value, subValue)
  props.forEach(prop => prop[$$recalcs].push(recalc))
  const renderers = props.map(prop => prop[$$renderer])

  return function (Component) {
    return class $Proper extends React.Component {
      constructor(_props) {
        super(_props)
        this.isExpire = false
        this.isUnmount = false
        renderers.forEach(renderer => renderer.connect(this))
        this.renderers = renderers
      }
      componentWillUnmount() {
        this.isUnmount = true
        Renderer.disconnect(...this.renderers)
      }
      update() {
        if (!this.isUnmount && this.isExpire) {
          this.forceUpdate()
        }
      }
      render() {
        this.isExpire = false
        return React.createElement(Component, Object.assign({}, value, this.props))
      }
    }
  }
}

export default Prop

import Store from "rako"
import React from "react"

const $$private = Symbol ? Symbol('private') : '(private)'

class Renderer {
  constructor(store) {
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
  renderers: new Set(),
  isScheduled: false,
  disconnect(renderers) {
    renderers.forEach(renderer => this.renderers.add(renderer))
    if (!this.isScheduled) {
      this.isScheduled = true
      const clear = () => {
        const renderersArray = [...this.renderers.values()]
        renderersArray.forEach(renderer => {
          renderer.instances = renderer.instances.filter(instance => !instance.isUnmount)
        })
        this.renderers.clear()
        this.isScheduled = false
      }
      if (requestIdleCallback) {
        requestIdleCallback(clear)
      } else {
        setTimeout(clear, 250);
      }
    }
  }
}
Renderer.disconnect = disconnector.disconnect.bind(disconnector)

const map = new Map()
function createRenderer(store) {
  if (!(store instanceof Store)) {
    throw new TypeError('Expected store to be an instance of Store.')
  }
  if (map.has(store)) {
    return map.get(store)
  }
  const renderer = new Renderer(store)
  map.set(store, renderer)
  return renderer
}

class Prop {
  constructor(store, mapper = (state, updater) => Object.assign({}, state, updater)) {
    const renderer = createRenderer(store)
    if (typeof mapper !== 'function') {
      throw new TypeError('Expected mapper to be a function.')
    }
    const updater = store.getUpdater()
    const value = mapper(store.getState(), updater)
    const calcs = []
    const _private = {renderer, value, calcs}
    renderer.subscribe(state => {
      _private.value = mapper(state, updater)
      calcs.forEach(calc => calc(_private.value))
    })
    this[$$private] = _private
  }
}

Prop.assign = function (...values) {
  const props = []
  const objects = []
  values.forEach(value => {
    if (value instanceof Prop) {
      props.push(value[$$private])
    } else if (typeof value === 'object') {
      objects.push(value)
    } else {
      throw new TypeError('Expected values to be an object or an instance of Prop.')
    }
  })

  const value = Object.assign({}, ...objects, ...props.map(({value}) => value))
  const calc = subValue => Object.assign(value, subValue)
  const renderers = []
  props.forEach(({calcs, renderer}) => {
    calcs.push(calc)
    renderers.push(renderer)
  })

  return function (Component) {
    return class $Proper extends React.Component {
      constructor(_props) {
        super(_props)
        this.isExpire = false
        this.isUnmount = false
        renderers.forEach(renderer => renderer.connect(this))
      }
      componentWillUnmount() {
        this.isUnmount = true
        Renderer.disconnect(renderers)
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

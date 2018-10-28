import Store from "rako"
import React from "react"
import {createRenderer, disconnect} from "./Renderer"

const $$private = Symbol ? Symbol('private') : '(private)'

class Prop {
  constructor(store, mapper) {
    const renderer = createRenderer(store)
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


const map = new Map()
const defaultMapper = (state, updater) => Object.assign({}, state, updater)

function prop(store, mapper = defaultMapper) {
  if (!(store instanceof Store)) {
    throw new TypeError('Expected store to be an instance of Store.')
  }
  if (typeof mapper !== 'function') {
    throw new TypeError('Expected mapper to be a function.')
  }
  if (mapper === defaultMapper) {
    if (map.has(store)) {
      return map.get(store)
    }
    const ret = new Prop(store, mapper)
    map.set(store, ret)
    return ret
  }
  return new Prop(store, mapper)
}

function assign(...values) {
  const props = []
  const objects = []
  values.forEach(value => {
    if (value instanceof Prop) {
      props.push(value[$$private])
    } else if (value instanceof Store) {
      props.push(prop(value)[$$private])
    } else if (typeof value === 'object') {
      objects.push(value)
    } else {
      throw new TypeError('Expected each value to be an object, an instance of Prop or an instance of Store.')
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
        // It can work well in sync rendering but async rendering. React doesn't provide enought API.
        renderers.forEach(renderer => renderer.connect(this))
      }
      componentWillUnmount() {
        this.isUnmount = true
        disconnect(renderers)
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

export {
  prop,
  assign
}

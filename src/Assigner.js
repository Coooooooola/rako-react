import Store from 'rako'
import React from 'react'
import {scheduleClean} from './cleaner'
import {getStoreAgent} from './StoreAgent'
import {link} from './link'
import {defaultMapper, uniqueFlag} from './utils'

class Assigner {
  constructor(isEqual, values) {
    this.value = undefined
    this.instances = []
    this.isEqual = isEqual
    this.isScheduled = false

    const objects = []
    const linkers = []
    values.forEach(value => {
      if (value instanceof Store) {
        linkers.push(link(value, defaultMapper))
      } else if (typeof value === 'function') {
        linkers.push(value)
      } else if (typeof value === 'object') {
        objects.push(value)
      } else {
        throw new TypeError('`assign`: Expected each value in `values` to be an object, a store or a `linker`.')
      }
    })

    const stores = new Array(linkers.length)
    linkers.forEach((linker, index) => {
      const flag = linker((flag, store, mapper) => {
        if (flag === uniqueFlag) {
          stores[index] = store
          objects.push(getStoreAgent(store).connect(this, mapper))
          return uniqueFlag
        }
      })
      if (flag !== uniqueFlag) {
        throw new TypeError('`assign`: Expected each value in `values` to be an object, a store or a `linker`.')
      }
    })
    if (stores.length !== new Set(stores).size) {
      throw new Error('`assign`: Don\'t pass duplicate `store` to `assign`.')
    }

    this.value = Object.freeze(Object.assign({}, ...objects))
  }
  calculate(subvalue) {
    const oldvalue = this.value
    this.value = Object.freeze(Object.assign({}, oldvalue, subvalue))
    const result = this.isEqual(this.value, oldvalue)
    if (typeof result !== 'boolean') {
      throw new TypeError('Expected returned value from `isEqual` to be a boolean.')
    }
    return result ? null : this.render.bind(this)
  }
  render() {
    this.instances.forEach(instance => {
      if (!instance.isUnmounted) {
        instance.forceUpdate()
      }
    })
  }
  clean() {
    if (!this.isScheduled) {
      this.isScheduled = true
      scheduleClean(() => {
        this.isScheduled = false
        this.instances = this.instances.filter(instance => !instance.isUnmounted)
      })
    }
  }
  hoc(Component) {
    const context = this
    return class Assigner extends React.Component {
      constructor(props) {
        super(props)
        this.isUnmounted = false
      }
      componentWillUnmount() {
        this.isUnmounted = true
        context.clean()
      }
      componentDidMount() {
        context.instances.push(this)
      }
      render() {
        return React.createElement(Component, Object.assign({}, context.value, this.props))
      }
    }
  }
}

export default Assigner

import {Component, createElement} from 'react'
import {$$typeofStoreContext} from './createStoreContexts'

function getStoreProvider(...storeContexts) {
  if (storeContexts.some(sc => sc.$$typeofStoreContext !== $$typeofStoreContext)) {
    throw new TypeError('`getStoreProvider`: Expected every `storeContext` to be a `StoreContext`.')
  }
  return class StoreProvider extends Component {
    constructor(props) {
      super(props)
      this._memoStoreValues = storeContexts.map(sc => sc._storeValue)
    }
    componentDidMount() {
      storeContexts.forEach(sc => sc._storeProviders.push(this))
      if (this._memoStoreValues.some((sv, i) => sv !== storeContexts[i]._storeValue)) {
        this.forceUpdate()
      }
      this._memoStoreValues = null
    }
    componentWillUnmount() {
      storeContexts.forEach(sc => {
        sc._storeProviders.splice(sc._storeProviders.indexOf(this), 1)
      })
    }
    render() {
      return storeContexts.reduceRight(
        (wrapped, wrapper) => createElement(wrapper._Provider, wrapper._storeValue, wrapped),
        this.props.children
      )
    }
  }
}

export default getStoreProvider

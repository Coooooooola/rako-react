import Store from 'rako'
import {createContext} from 'react'
import getStoreProvider from './getStoreProvider'

const $$typeofStoreContext = Symbol ? Symbol('store-context') : {}

function createStoreContexts(...stores) {
  if (!stores.every(store => store instanceof Store)) {
    throw new TypeError('`createStoreContexts`: Expected every `store` to be a `Store`.')
  }
  return stores.map(({getState, getActions, subscribe}) => {
    const actions = getActions()

    const {Provider: _Provider, ...rest} = createContext()
    const storeContext = {
      $$typeofStoreContext,
      StoreProvider: null,
      _Provider,
      _storeValue: {value: Object.assign({}, getState(), actions)},
      _storeProviders: [],
      ...rest
    }
    storeContext.StoreProvider = getStoreProvider(storeContext)
    subscribe(({state}) => {
      storeContext._storeValue = {value: Object.assign({}, state, actions)}
      storeContext._storeProviders.forEach(sp => sp.forceUpdate())
    })
    return storeContext
  })
}


export {
  $$typeofStoreContext
}

export default createStoreContexts

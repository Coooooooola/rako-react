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

    const storeContext = Object.assign(createContext(), {
      $$typeofStoreContext,
      StoreProvider: null,
      _Provider: null,
      _storeValue: {value: Object.assign({}, getState(), actions)},
      _updates: [],
    })
    storeContext._Provider = storeContext.Provider
    storeContext.Provider = undefined
    storeContext.StoreProvider = getStoreProvider(storeContext)

    subscribe(({state}) => {
      storeContext._storeValue = {value: Object.assign({}, state, actions)}
      storeContext._updates.forEach(update => update(bool => !bool))
    })
    return storeContext
  })
}


export {
  $$typeofStoreContext
}

export default createStoreContexts

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

    const context = createContext()
    Object.assign(context, {
      $$typeofStoreContext,
      StoreProvider: null,
      _storeValue: {value: Object.assign({}, getState(), actions)},
      _storeProviders: [],
    })
    context.StoreProvider = getStoreProvider(context)
    subscribe(({state}) => {
      context._storeValue = {value: Object.assign({}, state, actions)}
      context._storeProviders.forEach(sp => sp.forceUpdate())
    })
    return context
  })
}


export {
  $$typeofStoreContext
}

export default createStoreContexts

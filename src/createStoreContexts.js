import Store from 'rako'
import {createContext} from 'react'
import {getStoreProvider} from './getStoreProvider'


function createStoreContexts(...stores) {
  if (!stores.every(store => store instanceof Store)) {
    throw new TypeError('Expected every `store` to be a `Store`.')
  }
  return stores.map(({getState, getActions, subscribe}) => {
    const actions = getActions()

    const storeContext = createContext()
    const updates = []
    const rakoReact = {
      Provider: storeContext.Provider,
      state: getState(),
      actions,
      lazyValue: null,
      updates
    }
    storeContext.Provider = undefined
    storeContext.__rakoReact = rakoReact
    storeContext.StoreProvider = getStoreProvider(storeContext)

    subscribe(function renderStoreContext(state) {
      if (!updates.length) {
        rakoReact.state = state
        rakoReact.lazyValue = null
        return
      }

      rakoReact.state = null
      rakoReact.lazyValue = {value: Object.assign({}, state, actions)}
      for (const update of updates) {
        update(bool => !bool)
      }
    })
    return storeContext
  })
}


export {
  createStoreContexts
}

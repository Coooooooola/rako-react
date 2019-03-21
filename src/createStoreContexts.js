import Store from 'rako'
import {createContext} from 'react'
import {getStoreProvider} from './getStoreProvider'


function createStoreContexts(...stores) {
  if (!stores.every(store => store instanceof Store)) {
    throw new TypeError('Expected every `store` to be a `Store`.')
  }

  return stores.map(({getState, getActions, subscribe}) => {
    const actions = getActions()
    let state = getState()
    let lazyValue = null

    let updates = []
    let hasNullInUpdates = false

    let callStackDepth = 0


    const storeContext = createContext()

    const rakoReact = {
      Provider: storeContext.Provider,
      getValue() {
        if (!lazyValue) {
          lazyValue = {value: Object.assign({}, state, actions)}
        }
        return lazyValue
      },
      subscribe(update) {
        updates.push(update)

        const border = updates.length
        return function unsubscribe() {
          const index = updates.lastIndexOf(update, border)
          if (callStackDepth) {
            updates[index] = null
            hasNullInUpdates = true
          } else {
            updates.splice(index, 1)
          }
        }
      }
    }
    storeContext.Provider = undefined
    storeContext.__rakoReact = rakoReact
    storeContext.StoreProvider = getStoreProvider(storeContext)


    subscribe(function renderStoreContext(_state) {
      if (!updates.length) {
        state = _state
        lazyValue = null
        return
      }

      state = null
      lazyValue = {value: Object.assign({}, _state, actions)}
      const currentLazyValue = lazyValue

      callStackDepth += 1
      try {
        for (let i = 0, length = updates.length; i < length && currentLazyValue === lazyValue; i++) {
          if (updates[i]) {
            updates[i](bool => !bool)
          }
        }
      } finally {
        callStackDepth -= 1
        if (!callStackDepth && hasNullInUpdates) {
          updates = updates.filter(update => !!update)
          hasNullInUpdates = false
        }
      }
    })


    return storeContext
  })
}


export {
  createStoreContexts
}

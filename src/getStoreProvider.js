import {createElement, useState, useLayoutEffect, useMemo} from 'react'
import {$$typeofStoreContext} from './createStoreContexts'

function getStoreProvider(...storeContexts) {
  if (storeContexts.some(sc => sc.$$typeofStoreContext !== $$typeofStoreContext)) {
    throw new TypeError('Expected every `storeContext` to be a `StoreContext`.')
  }
  return function StoreProvider({children}) {
    const [, update] = useState(true)
    const storeValues = useMemo(() => storeContexts.map(sc => sc._storeValue), [])

    useLayoutEffect(function connectStoreContext() {
      for (const {_updates} of storeContexts) {
        _updates.push(update)
      }

      if (storeContexts.some((sc, i) => sc._storeValue !== storeValues[i])) {
        update(bool => !bool)
      }
      storeValues.length = 0

      return function cleanStoreContext() {
        for (const {_updates} of storeContexts) {
          _updates.splice(_updates.indexOf(update), 1)
        }
      }
    }, [])

    let ret = children
    for (let i = storeContexts.length - 1; i >= 0; i--) {
      const sc = storeContexts[i]
      ret = createElement(sc._Provider, sc._storeValue, ret)
    }
    return ret
  }
}

export {
  getStoreProvider
}

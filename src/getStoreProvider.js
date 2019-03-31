import {createElement, useState, useLayoutEffect, useMemo} from 'react'


const _hasOwnProperty = Object.hasOwnProperty

const EMPTY_ARRAY = []

function getStoreProvider(...storeContexts) {
  if (!storeContexts.every(sc => sc != null && typeof sc === 'object' && _hasOwnProperty.call(sc, '__rakoReact'))) {
    throw new TypeError('Expected every `storeContext` to be a `StoreContext`.')
  }
  const rakoReacts = storeContexts.map(sc => sc.__rakoReact)

  function getValues() {
    return rakoReacts.map(rr => rr.getValue())
  }

  return function StoreProvider({children}) {
    const [, update] = useState(true)

    const values = useMemo(getValues, EMPTY_ARRAY)

    useLayoutEffect(function connectStoreContext() {
      const unsubscribes = rakoReacts.map(rr => rr.subscribe(update))

      if (rakoReacts.some((rr, i) => rr.getValue() !== values[i])) {
        update(bool => !bool)
      }
      values.length = 0

      return function cleanStoreContext() {
        for (const unsubscribe of unsubscribes) {
          unsubscribe()
        }
      }
    }, EMPTY_ARRAY)

    let ret = children
    for (let i = rakoReacts.length - 1; i >= 0; i--) {
      const rr = rakoReacts[i]
      ret = createElement(rr.Provider, rr.getValue(), ret)
    }
    return ret
  }
}


export {
  getStoreProvider
}

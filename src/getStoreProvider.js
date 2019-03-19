import {createElement, useState, useLayoutEffect, useMemo} from 'react'


const EMPTY_ARRAY = []

function getStoreProvider(...storeContexts) {
  if (!storeContexts.every(sc => sc != null && typeof sc === 'object' && '__rakoReact' in sc)) {
    throw new TypeError('Expected every `storeContext` to be a `StoreContext`.')
  }
  const rakoReacts = storeContexts.map(sc => sc.__rakoReact)

  function getLazyValues() {
    return rakoReacts.map(rr => {
      if (rr.lazyValue === null) {
        rr.lazyValue = {value: Object.assign({}, rr.state, rr.actions)}
      }
      return rr.lazyValue
    })
  }

  return function StoreProvider({children}) {
    const [, update] = useState(true)

    const lazyValues = useMemo(getLazyValues, EMPTY_ARRAY)

    useLayoutEffect(function connectStoreContext() {
      for (const {updates} of rakoReacts) {
        updates.push(update)
      }

      if (rakoReacts.some((rr, i) => rr.lazyValue !== lazyValues[i])) {
        update(bool => !bool)
      }
      lazyValues.length = 0

      return function cleanStoreContext() {
        for (const {updates} of rakoReacts) {
          updates.splice(updates.indexOf(update), 1)
        }
      }
    }, EMPTY_ARRAY)

    let ret = children
    for (let i = rakoReacts.length - 1; i >= 0; i--) {
      const rr = rakoReacts[i]
      ret = createElement(rr.Provider, rr.lazyValue, ret)
    }
    return ret
  }
}


export {
  getStoreProvider
}

import {createElement, useState, useLayoutEffect, useMemo} from 'react'
import {$$typeofStoreContext} from './createStoreContexts'

function getStoreProvider(...storeContexts) {
  if (storeContexts.some(sc => sc.$$typeofStoreContext !== $$typeofStoreContext)) {
    throw new TypeError('`getStoreProvider`: Expected every `storeContext` to be a `StoreContext`.')
  }
  return function StoreProvider({children}) {
    const [, update] = useState(true)
    const storeValues = useMemo(() => storeContexts.map(sc => sc._storeValue), [])

    useLayoutEffect(() => {
      storeContexts.forEach(sc => sc._updates.push(update))

      if (storeContexts.some((sc, i) => sc._storeValue !== storeValues[i])) {
        update(bool => !bool)
      }
      storeValues.length = 0

      return () => {
        storeContexts.forEach(({_updates}) => _updates.splice(_updates.indexOf(update)))
      }
    }, [])

    return storeContexts.reduceRight(
      (wrapped, wrapper) => createElement(wrapper._Provider, wrapper._storeValue, wrapped),
      children
    )
  }
}

export default getStoreProvider

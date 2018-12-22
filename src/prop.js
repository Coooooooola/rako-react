import Store from 'rako'
import {uniqueFlag} from './utils'

function prop(store, mapper) {
  if (!(store instanceof Store)) {
    throw new TypeError('`prop`: Expected `store` to be a `Store`, but got: ' + (store == null ? store : typeof store) + '.')
  }
  if (typeof mapper !== 'function') {
    throw new TypeError('`prop`: Expected `mapper` to be a function, but got: ' + (mapper == null ? mapper : typeof mapper) + '.')
  }
  return function connector(connect) {
    connect(uniqueFlag, store, mapper)
  }
}


export {
  prop
}

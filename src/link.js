import Store from 'rako'
import {uniqueFlag} from './utils'

function link(store, mapper) {
  if (!(store instanceof Store)) {
    throw new TypeError('`link`: Expected `store` to be a `Store`, but got: ' + (store == null ? store : typeof store) + '.')
  }
  if (typeof mapper !== 'function') {
    throw new TypeError('`link`: Expected `mapper` to be a function, but got: ' + (mapper == null ? mapper : typeof mapper) + '.')
  }
  return function linker(callee) {
    return callee(uniqueFlag, store, mapper)
  }
}


export {
  link
}

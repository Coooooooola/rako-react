import Assigner from './Assigner'
import {shallowEqual} from './utils'

function _assign(isEqual, values) {
  const assigner = new Assigner(isEqual, values)
  return assigner.hoc.bind(assigner)
}

function assign(...values) {
  return _assign(() => false, values)
}

function memoAssign(isEqual = shallowEqual) {
  if (typeof isEqual !== 'function') {
    throw new TypeError('`memoAssign`: Expected `isEqual` to be a function, but got: ' + (isEqual == null ? isEqual : typeof isEqual) + '.')
  }
  return function assign(...values) {
    return _assign(isEqual, values)
  }
}


export {
  assign,
  memoAssign
}

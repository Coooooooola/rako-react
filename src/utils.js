function defaultMapper(state, actions) {
  return Object.assign({}, state, actions)
}

function getCalculator(mapper) {
  return (state, actions) => {
    const ret = mapper(state, actions)
    if (typeof ret !== 'object') {
      throw new TypeError('Expected return value from `mapper` to be an object, but got: ' + (typeof ret) + '.')
    }
    return ret
  }
}

function __is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}
const _is = Object.is || __is

const _hasOwnProperty = Object.hasOwnProperty

function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1)

  if (keys1.length !== Object.keys(object2).length) {
    return false
  }
  return keys1.every(key => _hasOwnProperty.call(object2, key) && _is(object1[key], object2[key]))
}

const uniqueFlag = Object.freeze({})


export {
  defaultMapper,
  getCalculator,
  shallowEqual,
  uniqueFlag
}

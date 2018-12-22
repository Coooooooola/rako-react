function sortByOrder(a, b) {
  return a.order - b.order
}

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

function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1)

  if (keys1.length !== Object.keys(object2).length) {
    return false
  }
  return keys1.every(key => key in object2 && object1[key] === object2[key])
}

function _flat2D(arrays) {
  let length = 0
  arrays.forEach(array => {
    length += array.length
  })
  const ret = new Array(length)
  let index = 0
  arrays.forEach(array => array.forEach(value => {
    ret[index++] = value
  }))
  return ret
}
const _flat = Array.prototype.flat
const flatArrays = _flat ? arrays => _flat.call(arrays) : _flat2D

const incrementOrder = {
  order: 0,
  getOrder() {
    return this.order++
  }
}
const getOrder = incrementOrder.getOrder.bind(incrementOrder)

const uniqueFlag = Object.freeze({})


export {
  sortByOrder,
  defaultMapper,
  getCalculator,
  shallowEqual,
  flatArrays,
  getOrder,
  uniqueFlag
}

import {getCalculator} from './utils'
import ReactDOM from 'react-dom'

class StoreAgent {
  constructor(store) {
    this.state = store.getState()
    this.actions = store.getActions()
    this.calculates = []

    store.subscribe(state => {
      this.state = state
      ReactDOM.unstable_batchedUpdates(() => {
        this.calculates
          .map(calculate => calculate(state, this.actions))
          .filter(render => !!render)
          .forEach(render => render())
      })
    })
  }
  connect(assigner, mapper) {
    const calculator = getCalculator(mapper)
    this.calculates.push((state, actions) => assigner.calculate(calculator(state, actions)))
    return calculator(this.state, this.actions)
  }
}

const map = new WeakMap()
function getStoreAgent(store) {
  if (map.has(store)) {
    return map.get(store)
  }
  const storeAgent = new StoreAgent(store)
  map.set(store, storeAgent)
  return storeAgent
}


export {
  getStoreAgent
}

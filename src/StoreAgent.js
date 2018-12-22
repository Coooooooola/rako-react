import {scheduleRender} from './scheduler'
import {getCalculator} from './utils'

class StoreAgent {
  constructor(store) {
    this.state = store.getState()
    this.actions = store.getActions()
    this.isScheduled = false
    this.calculates = []

    store.subscribe(state => {
      this.state = state
      const assigners = this.calculates.map(calculate => calculate(state, this.actions)).filter(assigner => !!assigner)
      this.render(assigners)
    })
  }
  connect(assigner, mapper) {
    const calculator = getCalculator(mapper)
    this.calculates.push((state, actions) => assigner.calculate(calculator(state, actions)))
    return calculator(this.state, this.actions)
  }
  render(assigners) {
    if (!this.isScheduled && assigners.length) {
      this.isScheduled = true
      scheduleRender(() => {
        this.isScheduled = false
        return assigners
      })
    }
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

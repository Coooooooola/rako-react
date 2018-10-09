import Store from "rabbit-store";
import React from "react"

const $$store = Symbol('store')

class Injector {
  constructor(store) {
    if (!(store instanceof Store)) {
      throw new TypeError('')
    }
    this[$$store] = store
  }
  // low performance and maybe buggy
  Inject(Component) {
    if (Object.getPrototypeOf(Component) !== React.Component) {
      throw new TypeError('')
    }
    const store = this[$$store]
    return class $InjectedComponent extends React.Component {
      constructor(props) {
        super(props)
        this.cache = null
        this.unsubscribe = null
      }
      componentDidMount() {
        this.cache = {state: store.getState(), updaters: store.getUpdaters()}
        this.unsubscribe = store.subscribe(state => {
          this.cache.state = state
          this.forceUpdate()
        })
      }
      componentWillUnmount() {
        this.unsubscribe()
      }
      render() {
        return React.createElement(Component, Object.assign({}, this.cache, this.props))
      }
    }
  }
}

export default Injector

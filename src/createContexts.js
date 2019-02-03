import Store from 'rako'
import React from 'react'

function createContexts(...stores) {
  if (!stores.every(store => store instanceof Store)) {
    throw new TypeError('createContexts: Expected each `store` in `stores` to be `Store`.')
  }

  return stores.map(store => {
    const {Provider, ...rest} = React.createContext()
    class StoreProvider extends React.Component {
      constructor(props) {
        super(props)
        this.unsubscribe = undefined
        this.state = {...store.getState(), ...store.getActions()}
      }
      componentDidMount() {
        this.unsubscribe = store.subscribe(state => {
          this.setState(prevState => ({...prevState, ...state}))
        })
      }
      componentWillUnmount() {
        this.unsubscribe()
      }
      render() {
        return React.createElement(Provider, {value: this.state}, this.props.children)
      }
    }
    return {StoreProvider, ...rest}
  })
}

export default createContexts

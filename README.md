# rako-react

## Installation

`yarn add rako rako-react` or `npm install rako rako-react`.


## API

#### `prop(store: Store, mapper: function?): Prop`
- ##### `mapper(state: object, actions: object): object`

`mapper` default is `(state, actions) => Object.assign({}, state, actions)`.

#### `assign(...values: Array<Prop|Store|object>): function`

## Demo

```js
import {createStores} from 'rako'
import {prop, assign} from 'rako-react'

const {profile$, bank$} = createStores({profile, bank})
```

With decorator:
```js
@assign(
  prop(profile$, state => state),
  bank$
)
class App extends React.Component {}
```

Without decorator:
```js
class App extends React.Component {}

export default assign(
  prop(profile$, state => state),
  bank$
)(App)
````

Assign values to a function component:
```js
function App(props) {
  // TODO
}
App = assign(
  prop(profile$, state => state),
  bank$
)(App)
```


example link: https://codesandbox.io/s/011136qpkn

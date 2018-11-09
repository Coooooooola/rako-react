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
import {assign} from 'rako-react'

const {counter$} = createStores({counter})
```

With decorator:
```js
@assign(counter$)
class Counter extends React.Component {}
```

Without decorator:
```js
class Counter extends React.Component {}

export default assign(counter$)(Counter)
````

Assign values to a function component:
```js
function Counter(props) {
  // TODO
}
Counter = assign(counter$)(Counter)
```


example link: https://codesandbox.io/s/011136qpkn

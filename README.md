# rako-react



## Installation

`yarn add rako rako-react` or `npm install rako rako-react`.



## Example

https://codesandbox.io/s/011136qpkn

After you open the link of **codeSandbox** above, because **codeSandbox** doesn't support `console.group`, please press **`Ctrl + Shift + J`**(on Windows) or **`Ctrl + Option + J`**(on macOS) to open **DevTools > Console**.



## Usage

```js
import {createStores} from 'rako'
import {assign, prop} from 'rako-react'

const {storeA$, storeB$} = createStores({storeA, storeB})
```
Inject `storeA$`'s __state__ and `storeB$`'s __state and action__ into React component `App`.

With decorator:
```js
@assign(
  prop(storeA$, state => state),
  storeB$
)
class App extends React.Component {}
```

Without decorator:
```js
class App extends React.Component {}

App = assign(
  prop(storeA$, state => state),
  storeB$
)(App)
```
`prop`'s second parameter is `mapper`, default is `(state, actions) => Object.assign({}, state, actions)`.


## API

#### `prop(store: Store, mapper: function?): Prop`
- ##### `mapper(state: object, actions: object): object`

`mapper` default is `(state, actions) => Object.assign({}, state, actions)`.

#### `assign(...values: Array<Prop|Store|object>): function`

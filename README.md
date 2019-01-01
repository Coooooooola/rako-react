# rako-react



## Installation

`yarn add rako rako-react` or `npm install rako rako-react`.



## Example

https://codesandbox.io/s/011136qpkn

After you open the link of **codeSandbox** above, because **codeSandbox** doesn't support `console.group`, please press **`Ctrl + Shift + J`**(on Windows) or **`Ctrl + Option + J`**(on macOS) to open **DevTools > Console**.



## Usage

```js
import {createStores} from 'rako'
import {assign, memoAssign, link} from 'rako-react'

const [profileStore, themeStore] = createStores(profile, theme)
```
Inject `profileStore`'s __state__ and `themeStore`'s __state and action__ into React component `App`.

```js
class App extends React.Component {}

App = assign(
  {title: 'example'},
  profileStore, // `profileStore` will be wrapped automatically to
                // `link(profileStore, (state, actions) => Object.assign({}, state, actions))`
  link(themeStore, state => state)
)(App)
```
You can also use `memoAssign` to optimize performance.
```js
class App extends React.Component {}

App = memoAssign(function isEqual(newvalue, oldvalue) {
  // TODO: Return a boolean. Render if return false.
})(
  {title: 'example'},
  profileStore,
  link(themeStore, state => state)
)(App)
```



## API

#### `link(store: Store, mapper: function): linker`
> `mapper(state: object, actions: object): object`

#### `assign(...values: Array<Store|linker|object>): function`

#### `memoAssign(isEqual: function = shallowEqual): assign`
> `isEqual(newvalue: object, oldvalue: object): boolean`

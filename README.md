# rako-react

## Installation

`yarn add rako rako-react` or `npm install rako rako-react`


## API

### `new Prop(store: Store, mapper: function?)`

### `Prop.assign(...props: Array<Prop|object>): function`

## Demo

with decorator
````js
@Prop.assign(
  new Prop(new Store(profile))
)
class App extends React.Component {} 
````
without decorator
````js
Prop.assign(
  new Prop(new Store(profile))
)(App)
````

example link: https://codesandbox.io/s/011136qpkn
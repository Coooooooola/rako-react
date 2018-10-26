# rako-react

## Installation

`yarn add rako rako-react` or `npm install rako rako-react`


## API

#### `new Prop(store: Store, mapper: function?)`
- ##### `mapper(state: object, updater: object): object`

#### `Prop.assign(...values: Array<Prop|object>): function`

## Demo

with decorator
````js
@Prop.assign(
  new Prop(new Store(profile), state => state),
  new Prop(new Store(bank))
)
class App extends React.Component {} 
````
without decorator
````js
Prop.assign(
  new Prop(new Store(profile), state => state),
  new Prop(new Store(bank))
)(App)
````

example link: https://codesandbox.io/s/011136qpkn
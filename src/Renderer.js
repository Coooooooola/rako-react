class Renderer {
  constructor(store) {
    this.listeners = []
    this.instances = []
    store.subscribe(this.render.bind(this))
  }
  subscribe(listener) {
    this.listeners.push(listener)
  }
  connect(instance) {
    this.instances.push(instance)
  }
  render(state) {
    this.listeners.forEach(listener => listener(state))

    this.instances.forEach(instance => {
      instance.isExpire = true
    })
    this.instances.forEach(instance => instance.update())
  }
}
const disconnector = {
  renderers: new Set(),
  isScheduled: false,
  disconnect(renderers) {
    renderers.forEach(renderer => this.renderers.add(renderer))
    if (!this.isScheduled) {
      this.isScheduled = true
      const clear = () => {
        this.isScheduled = false
        const renderersArray = [...this.renderers.values()]
        renderersArray.forEach(renderer => {
          renderer.instances = renderer.instances.filter(instance => !instance.isUnmount)
        })
        this.renderers.clear()
      }
      if (requestIdleCallback) {
        requestIdleCallback(clear)
      } else {
        setTimeout(clear, 250);
      }
    }
  }
}
const disconnect = disconnector.disconnect.bind(disconnector)

const map = new Map()
function createRenderer(store) {
  if (map.has(store)) {
    return map.get(store)
  }
  const renderer = new Renderer(store)
  map.set(store, renderer)
  return renderer
}

export {
  createRenderer,
  disconnect
}

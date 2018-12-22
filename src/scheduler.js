import {sortByOrder, flatArrays} from './utils'

const scheduler = {
  isScheduled: false,
  arranges: [],
  renders: [],
  scheduleArrange(arrange) {
    this.arranges.push(arrange)
    this.scheduleTask()
  },
  scheduleRender(render) {
    this.renders.push(render)
    this.scheduleTask()
  },
  scheduleTask() {
    if (!this.isScheduled) {
      this.isScheduled = true
      const {arranges, renders} = this
      const task = () => {
        this.isScheduled = false

        if (arranges.length) {
          arranges.forEach(arrange => arrange())
          arranges.length = 0
        }

        if (renders.length) {
          const assignersArray = renders.map(render => render())
          renders.length = 0

          const assigners = assignersArray.length === 1 ? assignersArray[0] : [...new Set(flatArrays(assignersArray))]
          flatArrays(assigners.map(assigner => assigner.instances))
            .sort(sortByOrder)
            .forEach(function updateInstance(instance) {
              instance.update()
            })
        }
      }
      Promise.resolve().then(task)
    }
  }
}

const scheduleArrange = scheduler.scheduleArrange.bind(scheduler)
const scheduleRender = scheduler.scheduleRender.bind(scheduler)


export {
  scheduleArrange,
  scheduleRender
}

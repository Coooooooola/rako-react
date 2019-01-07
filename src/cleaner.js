const cleaner = {
  cleans: [],
  isScheduled: false,
  scheduleClean(clean) {
    const {cleans} = this
    cleans.push(clean)
    if (!this.isScheduled) {
      this.isScheduled = true
      setTimeout(() => {
        this.isScheduled = false
        cleans.forEach(clean => clean())
        cleans.length = 0
      }, 480)
    }
  }
}

const scheduleClean = cleaner.scheduleClean.bind(cleaner)


export {
  scheduleClean
}

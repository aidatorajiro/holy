class ProcessManagement {
    constructor () {
        this.processes = []
        Globals.event.addListener("beforeunload", (ev) => {
            for (let proc of this.processes) {
                proc.kill('SIGINT')
            }
        })
    }

    spawn (...args) {
        let child_process = require('child_process')
        let child = child_process.spawn(...args)
        this.processes.push(child)
        return child
    }
}
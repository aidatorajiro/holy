class Movement {
    constructor () {
        this.pressingkeys = new Set()
        Globals.event.addListener("keydown", (ev) => {
            this.pressingkeys.add(ev.key)
        });
        Globals.event.addListener("keyup", (ev) => {
            this.pressingkeys.delete(ev.key)
        });
        let a = 40
        let f = (x) => (Math.atan( ( 1 / ( a * 2 / Math.PI ) ) * x ) * a * 2 / Math.PI)
        let rnd = Utils.rnd("movement.js precious seed " + Math.random())
        Globals.event.addListener("animate", (ev) => {
            for (let k of this.pressingkeys) {
                let d = f(ev.delta)
                let r = rnd()
                let c = 0.5 + (r - 0.5)*0.4
                if (k === 'd') {
                    Globals.camera.position.x += d*c
                }
                if (k === 'a') {
                    Globals.camera.position.x -= d*c
                }
                if (k === 'w') {
                    Globals.camera.position.y += d*c
                }
                if (k === 's') {
                    Globals.camera.position.y -= d*c
                }
            }
        });
    }
}
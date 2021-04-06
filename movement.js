class Movement {
    constructor () {
        this.pressingkey = undefined
        Globals.event.addListener("keydown", (ev) => {
            this.pressingkey = ev.key
        });
        Globals.event.addListener("keyup", (ev) => {
            this.pressingkey = undefined
        });
        let a = 40
        let f = (x) => (Math.atan( ( 1 / ( a * 2 / Math.PI ) ) * x ) * a * 2 / Math.PI)
        let rnd = Utils.rnd("movement.js precious seed " + Math.random())
        Globals.event.addListener("animate", (ev) => {
            let d = f(ev.delta)
            let r = rnd()
            let c = 0.5 + (r - 0.5)*0.4
            if (this.pressingkey === 'd') {
                Globals.camera.position.x += d*c
            }
            if (this.pressingkey === 'a') {
                Globals.camera.position.x -= d*c
            }
            if (this.pressingkey === 'w') {
                Globals.camera.position.y += d*c
            }
            if (this.pressingkey === 's') {
                Globals.camera.position.y -= d*c
            }
        });
    }
}
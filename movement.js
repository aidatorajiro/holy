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
        Globals.event.addListener("animate", (ev) => {
            let d = f(ev.delta)
            if (this.pressingkey === 'd') {
                Globals.camera.position.x += 0.5*d
            }
            if (this.pressingkey === 'a') {
                Globals.camera.position.x -= 0.5*d
            }
            if (this.pressingkey === 'w') {
                Globals.camera.position.y += 0.5*d
            }
            if (this.pressingkey === 's') {
                Globals.camera.position.y -= 0.5*d
            }
        });
    }
}
class Movement {
    constructor () {
        this.pressingkey = undefined
        Globals.event.addListener("keydown", (ev) => {
            this.pressingkey = ev.key
        });
        Globals.event.addListener("keyup", (ev) => {
            this.pressingkey = undefined
        });
        Globals.event.addListener("animate", (ev) => {
            if (this.pressingkey === 'd') {
                Globals.camera.position.x += 0.5*ev.delta
            }
            if (this.pressingkey === 'a') {
                Globals.camera.position.x -= 0.5*ev.delta
            }
            if (this.pressingkey === 'w') {
                Globals.camera.position.y += 0.5*ev.delta
            }
            if (this.pressingkey === 's') {
                Globals.camera.position.y -= 0.5*ev.delta
            }
        });
    }
}
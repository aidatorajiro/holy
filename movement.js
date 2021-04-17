class Movement {
    constructor () {
        this.keyboardPressing = new Set()
        Globals.event.addListener("keydown", (ev) => {
            if (ev.key === 'w' || ev.key === 'a' || ev.key === 's' || ev.key === 'd') {
                this.keyboardPressing.add(ev.key)
            }
        });
        Globals.event.addListener("keyup", (ev) => {
            this.keyboardPressing.delete(ev.key)
        });
        this.gamepadPressing = new Set()
        this.pressing = new Set()
        let a = 40
        let f = (x) => (Math.atan( ( 1 / ( a * 2 / Math.PI ) ) * x ) * a * 2 / Math.PI)
        let rnd = Utils.rnd("movement.js precious seed " + Math.random())
        this.lastChecked = undefined;
        this.traces = [];
        Globals.event.addListener("animate", (ev) => {
            if (this.lastChecked === undefined) {
                this.lastChecked = Globals.time
            }
            if (Globals.time - this.lastChecked > 100) {
                this.lastChecked = Globals.time
                let gp = navigator.getGamepads()[0];

                // construct gamepadPressing
                this.gamepadPressing.clear();
                if (gp !== null) {
                    if (gp.id === "USB Gamepad  (Vendor: 0079 Product: 0011)") {
                        if (gp.buttons[0].pressed) {
                            this.gamepadPressing.add("a")
                        }
                        if (gp.buttons[3].pressed) {
                            this.gamepadPressing.add("d")
                        }
                        if (gp.buttons[2].pressed) {
                            this.gamepadPressing.add("w")
                        }
                        if (gp.buttons[1].pressed) {
                            this.gamepadPressing.add("s")
                        }
                    } else {
                        if (gp.axes[0] < -0.5) {
                            this.gamepadPressing.add("a")
                        } else if (gp.axes[0] > 0.5) {
                            this.gamepadPressing.add("d")
                        }
                        if (gp.axes[1] < -0.5) {
                            this.gamepadPressing.add("w")
                        } else if (gp.axes[1] > 0.5) {
                            this.gamepadPressing.add("s")
                        }
                    }
                }
            }

            // merge two sets
            this.pressing.clear()
            for (let x of this.keyboardPressing) {
                this.pressing.add(x)
            }
            for (let x of this.gamepadPressing) {
                this.pressing.add(x)
            }

            for (let k of this.pressing) {
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
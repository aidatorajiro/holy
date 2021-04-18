class Movement {
    constructor () {
        this.keyboardPressing = 0
        this.gamepadPressing = 0
        this.pressing = 0

        let flags = {'d': 1, 'a': 2, 'w': 4, 's': 8}
        this.flags = flags

        let a = 40
        let f = (x) => (Math.atan( ( 1 / ( a * 2 / Math.PI ) ) * x ) * a * 2 / Math.PI)

        let rnd = Utils.rnd("movement.js precious seed " + Math.random())
        this.lastGamepadChecked = undefined;
        this.trace = [];
        this.lastPressingTime = undefined;

        Globals.event.addListener("keydown", (ev) => {
            let flag = flags[ev.key]
            if (flag !== undefined) {
                this.keyboardPressing |= flag
            }
        });

        Globals.event.addListener("keyup", (ev) => {
            let flag = flags[ev.key]
            if (flag !== undefined && (this.keyboardPressing & flag) !== 0) {
                this.keyboardPressing ^= flag
            }
        });

        Globals.event.addListener("animate", (ev) => {
            if (this.lastPressingTime === undefined) {
                this.lastPressingTime = Globals.time
            }
            if (this.lastGamepadChecked === undefined) {
                this.lastGamepadChecked = Globals.time
            }
            if (Globals.time - this.lastGamepadChecked > 100) {
                this.lastGamepadChecked = Globals.time
                let gp = navigator.getGamepads()[0];

                // construct gamepadPressing
                if (gp !== null) {
                    if (gp.id === "USB Gamepad  (Vendor: 0079 Product: 0011)") {
                        if (gp.buttons[3].pressed) {
                            this.gamepadPressing |= flags["d"]
                        }
                        if (gp.buttons[0].pressed) {
                            this.gamepadPressing |= flags["a"]
                        }
                        if (gp.buttons[2].pressed) {
                            this.gamepadPressing |= flags["w"]
                        }
                        if (gp.buttons[1].pressed) {
                            this.gamepadPressing |= flags["s"]
                        }
                    } else {
                        if (gp.axes[0] > 0.5) {
                            this.gamepadPressing |= flags["d"]
                        } else if (gp.axes[0] < -0.5) {
                            this.gamepadPressing |= flags["a"]
                        }
                        if (gp.axes[1] < -0.5) {
                            this.gamepadPressing |= flags["w"]
                        } else if (gp.axes[1] > 0.5) {
                            this.gamepadPressing |= flags["s"]
                        }
                    }
                }

                // merge two sets
                let pr = this.keyboardPressing | this.gamepadPressing
                if (this.pressing != pr) {
                    this.trace.push([this.pressing, Globals.time - this.lastPressingTime])
                    this.lastPressingTime = Globals.time
                    this.pressing = pr
                }
            }

            let d = f(ev.delta)
            let r = rnd()
            let c = 0.5 + (r - 0.5)*0.4
            if (this.pressing & flags["d"]) {
                Globals.camera.position.x += d*c
            }
            if (this.pressing & flags["a"]) {
                Globals.camera.position.x -= d*c
            }
            if (this.pressing & flags["w"]) {
                Globals.camera.position.y += d*c
            }
            if (this.pressing & flags["s"]) {
                Globals.camera.position.y -= d*c
            }
        });
    }
}
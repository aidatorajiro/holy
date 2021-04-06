class Dynamic {
    constructor (x, y, w, h, lifetime = 100000) {
        this.box = new THREE.Box2(
            new THREE.Vector2(x - w/2, y - h/2),
            new THREE.Vector2(x + w/2, y + h/2)
        )
        this.event = new EventManagement()
        this.lastCreateTime = undefined
        this.created = false
        this.lifetime = lifetime
    }
    update () {
        let camera_box = Globals.cameraBox;
        if (camera_box.intersectsBox(this.box)) {
            if (this.created === false) {
                this.created = true
                this.lastCreateTime = Globals.time
                console.log("dynamic created at " + this.box.min.x + ", " + this.box.min.y + ", " + this.box.max.x + ", " + this.box.max.y)
                this.event.runEvent("create", this)
            }
        } else if (this.created === true && Globals.time - this.lastCreateTime > this.lifetime) {
            this.remove()
        }
    }
    remove () {
        console.log("dynamic removed at " + this.box.min.x + ", " + this.box.min.y + ", " + this.box.max.x + ", " + this.box.max.y)
        this.event.runEvent("remove", this)
        this.created = false
    }
    move (x, y) {
        console.log("dynamic moved: " + x + ", " + y)
        this.event.runEvent("move", [this, x, y])
        this.box.translate(new THREE.Vector2(x, y))
    }
}
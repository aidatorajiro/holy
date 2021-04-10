class DynamicCache {
    constructor () {
        this.entries = []
        this.cache = {}
        this.latticeSize = 500
    }
    getCoverBox(box) {
        let x1 = Math.floor(box.min.x / this.latticeSize)
        let y1 = Math.floor(box.min.y / this.latticeSize)
        let x2 = Math.floor(box.max.x / this.latticeSize)
        let y2 = Math.floor(box.max.y / this.latticeSize)
        return [x1, y1, x2, y2]
    }
    add (dyn) {
        this.entries.push(dyn)
        let [x1, y1, x2, y2] = this.getCoverBox(dyn.box);
        for (let i = x1; i < x2 + 1; i++) {
            for (let j = y1; j < y2 + 1; j++) {
                let key = i + "," + j;
                if (this.cache[key] === undefined) {
                    this.cache[key] = []
                }
                this.cache[key].push(dyn)
            }
        }
    }
    clear () {
        for (let e of this.entries) {
            e.remove()
        }
        this.cache = {}
    }
    getAllIntersects (box) {
        let [x1, y1, x2, y2] = this.getCoverBox(box);
        let candidates = new Set()
        for (let i = x1; i < x2 + 1; i++) {
            for (let j = y1; j < y2 + 1; j++) {
                let key = i + "," + j;
                if (this.cache[key] !== undefined) {
                    for (let dyn of this.cache[key]) {
                        candidates.add(dyn)
                    }
                }
            }
        }
        return Array.from(candidates).filter((x) => (x.box.intersectsBox(box)))
    }
    update () {
        let camera_box = Globals.cameraBox;
        let intersects = this.getAllIntersects(camera_box);
        for (let dyn of intersects) {
            if (dyn.created === false) {
                dyn.created = true
                dyn.lastCreateTime = Globals.time
                console.log("dynamic created at " + dyn.box.min.x + ", " + dyn.box.min.y + ", " + dyn.box.max.x + ", " + dyn.box.max.y)
                dyn.event.runEvent("create", dyn)
            }
        }
    }
}

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
    /*update () {
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
    }*/
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
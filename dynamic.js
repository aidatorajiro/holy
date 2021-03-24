// Dynamic Canvas
class Dynamic {
    constructor (x, y, w, h) {
        this.box = new THREE.Box2(
            new THREE.Vector2(x - w/2, y - h/2),
            new THREE.Vector2(x + w/2, y + h/2)
        )
        this.event = new EventManagement()
        this.created = false
        Globals.event.addListener("animate", () => {
            let camera_x = Globals.camera.position.x;
            let camera_y = Globals.camera.position.y;
            let camera_r = Globals.camera.right;
            let camera_t = Globals.camera.top;
            let camera_box = new THREE.Box2(
                new THREE.Vector2(camera_x - camera_r, camera_y - camera_t),
                new THREE.Vector2(camera_x + camera_r, camera_y + camera_t)
            )
            if (camera_box.intersectsBox(this.box) && this.created === false) {
                this.event.runEvent("create", {box: this.box})
                this.created = true
            }
        })
    }
    move (x, y) {
        console.log("moved: " + x + ", " + y); 
        this.box.translate(new THREE.Vector2(x, y))
    }
}
class Coordinator {
    constructor () {
        this.current_batch = undefined
        this.buildings = []
        this.building_layout = []
        this.bound = undefined
        this.makeBuildings()
    }
    makeBuildings () {
        Globals.raw.event.addListener("fetch_len", async (len) => {
            let line_char_max = 108;
            let fs = 32;
            let offset = 10*fs;

            let center_x = 100;
            let center_y = 100;
            let rnd = Utils.rnd(String(Math.random()));

            this.current_batch = Math.floor(rnd() * len);
            this.data = await Globals.raw.getBatch(this.current_batch);

            let size_list = [];
            for (let d of this.data) {
                let line_char = Math.min(Math.sqrt(d.length), line_char_max)
                console.log(line_char)
                let building = new Building(d, center_x, center_y, line_char, fs, fs, fs, fs/2)
                this.buildings.push(building)
                size_list.push([d.length, building.width, building.height, building])
            }
            size_list = size_list.sort((x, y) => y[0] - x[0]);

            let makeBox = (x, y, w, h) => {
                console.log(x, y, w, h)
                return new THREE.Box2(new THREE.Vector2(x - w/2, y - h/2), new THREE.Vector2(x + w/2, y + h/2));
            }

            let addBox = (b) => {
                this.building_layout.push(b)
                if (this.bound === undefined) {
                    this.bound = b
                } else {
                    this.bound = this.bound.union(b)
                }
            }

            for (let i = 0; i < size_list.length; i++) {
                let [_, w, h, building] = size_list[i]
                if (i === 0) {
                    addBox(makeBox(center_x, center_y, w, h))
                } else {
                    let y = rnd() * (this.bound.max.y - this.bound.min.y) + this.bound.min.y
                    let bigbox = makeBox(0, y, Infinity, h)
                    let localbound = this.building_layout.filter(b => b.intersectsBox(bigbox)).reduce((x, y) => (x.union(y)));
                    let box;
                    if (rnd() < 0.5) {
                        box = makeBox(localbound.min.x - w/2 - offset, y, w, h)
                    } else {
                        box = makeBox(localbound.max.x + w/2 + offset, y, w, h)
                    }
                    addBox(box)
                    let c = new THREE.Vector2()
                    box.getCenter(c)
                    building.move(c.x - center_x, c.y - center_y)
                }
            }
        });
    }
}
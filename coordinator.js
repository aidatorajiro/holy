class Coordinator {
    constructor () {
        this.current_batch = undefined
        this.buildings = []
        this.buildings_boxes = []
        this.buildings_flag = false
        Globals.camera.position.x = 10000000*Math.random()
        Globals.camera.position.y = 10000000*Math.random()
        Globals.event.addListener("animate", () => (this.animate.call(this)))
        Globals.raw.event.addListener("fetch_len", async (len) => {
            this.num_batches = len
        });
    }
    animate () {
        const fs = 32
        const base_len = 44
        const offset = 10*fs;
        const canvas_lines = 100;
        const gridsize = (base_len * fs);
        const xd = Math.floor(Globals.camera.position.x / gridsize)
        const yd = Math.floor(Globals.camera.position.y / gridsize)
        if (this.buildings_flag === false && this.num_batches !== undefined) {
            this.buildings_flag = true
            for (let b of this.buildings) {
                b.clear()
            }
            this.buildings = []
            this.makeBuildings(Globals.background.bg_params[0] + xd + "," + yd, fs, base_len, offset, canvas_lines, xd * gridsize, yd * gridsize)
        }
        for (let b of this.buildings) {
            b.update()
        }
    }
    async makeBuildings (seed, fs, base_len, offset, canvas_lines, center_x, center_y) {
        let rnd = Utils.rnd(seed);

        if (Debug.force_batch !== undefined) {
            this.current_batch = Debug.force_batch;
        } else {
            this.current_batch = Math.floor(rnd() * this.num_batches);
        }
        this.data = await Globals.raw.getBatch(this.current_batch);

        let size_list = [];
        for (let d of this.data) {
            let line_char = base_len + Math.floor(rnd()*base_len)
            let building = new Building(d, center_x, center_y, line_char, fs, fs, fs, fs/2, canvas_lines)
            this.buildings.push(building)
            size_list.push([d.length, building.width, building.height, building])
        }
        size_list = size_list.sort((x, y) => y[0] - x[0]);

        let x_l;
        let x_r;

        for (let i = 0; i < size_list.length; i++) {
            let [_, w, h, building] = size_list[i]
            if (i === 0) {
                x_l = -w/2 - offset
                x_r = w/2 + offset
            } else {
                if (rnd() < 0.5) {
                    building.move(x_l - w/2, 0)
                    x_l -= w + offset
                } else {
                    building.move(x_r + w/2, 0)
                    x_r += w + offset
                }
            }
        }
    }
}
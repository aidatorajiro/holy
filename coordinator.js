class Coordinator {
    constructor () {
        this.current_batch = undefined
        this.buildings = []
        this.makeBuildings()
    }
    makeBuildings () {
        Globals.raw.event.addListener("fetch_len", async (len) => {
            //let line_char_max = 108;
            let fs = 32;
            let offset = 10*fs;
            let canvas_lines = 100;

            let center_x = 0;
            let center_y = 0;
            let rnd = Utils.rnd(String(Math.random())); // TODO fix this

            if (Debug.force_batch !== undefined) {
                this.current_batch = Debug.force_batch;
            } else {
                this.current_batch = Math.floor(rnd() * len);
            }
            this.data = await Globals.raw.getBatch(this.current_batch);

            let size_list = [];
            for (let d of this.data) {
                //let line_char = Math.min(Math.sqrt(d.length), line_char_max)
                let line_char = 44 + Math.floor(rnd()*44)
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
        });
    }
}
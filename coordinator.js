class Coordinator {
    constructor () {
        this.current_batch = undefined
        this.buildings = []
        Globals.raw.event.addListener("fetch_len", async (len) => {
            this.current_batch = Math.floor(Math.random() * len)
            this.data = await Globals.raw.getBatch(this.current_batch)
            for (let d of this.data) {
                this.buildings.push(new Building(d, 0, 0, 44))
                break;
            }
        });
    }
}
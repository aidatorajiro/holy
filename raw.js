class Raw {
    constructor () {
        this.event = new EventManagement()
        this.batches = {}
        this.len = undefined
        fetch("batches/len.txt")
            .then(response => response.text())
            .then(data => {
                this.len = parseInt(data);
                this.event.runEvent("fetch_len", this.len);
            });
    }
    async getBatch (batch_id) {
        return new Promise((res, rej) => {
            fetch("batches/" + batch_id + ".json")
                .then(response => response.json())
                .then(data => {
                    res(data)
                    this.batches[batch_id] = data
                    this.event.runEvent("fetch_" + batch_id, data)
                })
                .catch(err =>
                    rej(err)
                );
        })
    }
}
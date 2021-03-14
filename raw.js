class Raw {
    constructor () {
        this.event = new EventManagement()
        let path = "out.small.json"
        fetch(path)
            .then(response => response.json())
            .then(data => {
                this.json = data;
                this.event.runEvent("load", this);
            });
    }
}
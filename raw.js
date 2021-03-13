class Raw {
    constructor () {
        let path = "out.small.json"
        fetch(path)
            .then(response => response.json())
            .then(data => {
                this.json = data;
                Globals.eventManagement.runEvent("rawReadComplete")
            });
    }
}
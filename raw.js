class Raw {
    constructor () {
        let use_large = false
        if (use_large) {
            fetch("out.json")
                .then(response => response.json())
                .then(data => this.json = data);
        } else {
            fetch("out.small.json")
                .then(response => response.json())
                .then(data => this.json = data);
        }
    }
}
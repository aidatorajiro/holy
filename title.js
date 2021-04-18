class Title {
    constructor () {
        Globals.event.addListener("animate", () => {this.animate.call(this)});
    }
    animate () {
    }
}
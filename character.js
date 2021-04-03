class Character {
    constructor () {
        this.special_emojis = []
        Globals.event.addListener("animate", () => (this.animate.call(this)))
    }
    animate () {
    }
}
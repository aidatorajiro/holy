class Character {
    constructor () {
        this.special_emojis = []
        Globals.event.addListener("animate", () => (this.animate.call(this)))
        let rnd = Utils.rnd("character.js precious seed " + Math.random())
        this.rnd = rnd;
    }
    animate () {
        let num_images = 18;
        for (let i = 0; i < num_images; i++) {
            let tex = await Globals.texture.get("assets/emoji/image-" + i + ".png");
            
        }
    }
}
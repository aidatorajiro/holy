let Debug = {
    force_batch: undefined,
    get_assets: function (asset) {
        return Globals.scene.children.filter(x=>x.material.uniforms.texture.value == Globals.texture.hashmap[asset])
    },
    jump_to_asset: function (asset = "assets/nn.png") {
        let n = this.get_assets(asset)[0];
        Globals.camera.position.x = n.position.x
        Globals.camera.position.y = n.position.y
    },
    jump_to_dec: function(k) {
        let d = Globals.coordinator.decorations[k]
        Globals.camera.position.x = d.position.x
        Globals.camera.position.y = d.position.y
    }
}

/*
let Debug = {
    force_batch: undefined
}
*/
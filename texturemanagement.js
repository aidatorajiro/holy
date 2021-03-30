class TextureManagement {
    constructor () {
        this.hashmap = {}
        this.loader = new THREE.TextureLoader()
    }
    get (url) {
        return new Promise((res, rej) => {
            if (url in this.hashmap) {
                res(this.hashmap[url])
            } else {
                this.loader.load(url, (texture) => {
                    this.hashmap[url] = texture
                    res(texture)
                })
            }
        })
    }
}
class Character {
    constructor () {
        Globals.event.addListener("animate", () => (this.animate.call(this)))
        let rnd = Utils.rnd("character.js precious seed " + Math.random())
        this.rnd = rnd;
        this.texture = [];
        this.data = [];
        this.urls = [];
        for (let i = 0; i < 18; i++) {
            this.urls.push("assets/emoji/image-" + i + ".png");
        }
        (async () => {
            for (let l of this.urls) {
                this.texture.push(await Globals.texture.get(l));
            }
        })();
    }
    animate () {
        const r = this.rnd
        if (this.texture.length === this.urls.length) { // if all textures loaded
            if (r() < 0.01) {
                let speed_x = r() - 0.5;
                let speed_y = r() - 0.5;
                let speed_rot_z = (r() - 0.5)*0.01;
                let spawn_side = Math.floor(r() * 2);
                let tex = this.texture[Math.floor(r() * this.texture.length)]
                let scale = r()*2
                let geometry = new THREE.PlaneGeometry(tex.image.width * scale, tex.image.height * scale, 1, 1);
                let material = new THREE.RawShaderMaterial({
                    uniforms: {
                      texture: { value: tex },
                      color: { value: new THREE.Vector4(r(), r(), r(), r()) }
                    },
                    vertexShader: Shaders.defaultVertexShader,
                    fragmentShader: `
precision mediump float;
uniform sampler2D texture;
uniform vec4 color;
varying vec2 vUv;
void main() {
vec4 tmp = texture2D(texture, vUv);
gl_FragColor = vec4(1.0 - tmp.r, 1.0 - tmp.g, 1.0 - tmp.b, tmp.a);
gl_FragColor *= color;
}
`,
                    transparent: true,
                });
                let mesh = new THREE.Mesh(geometry, material);
                Globals.scene.add(mesh);
                
                let box = Globals.cameraBox;
                if (spawn_side == 0) {
                    mesh.position.x = box.max.x - Math.random()*Globals.width
                    mesh.position.y = box.max.y
                }
                if (spawn_side == 1) {
                    mesh.position.x = box.min.x
                    mesh.position.y = box.max.y - Math.random()*Globals.height
                }
                if (spawn_side == 2) {
                    mesh.position.x = box.min.x + Math.random()*Globals.width
                    mesh.position.y = box.min.y
                }
                if (spawn_side == 3) {
                    mesh.position.x = box.max.x
                    mesh.position.y = box.min.y + Math.random()*Globals.height
                }

                console.log("character added")

                this.data.push([speed_x, speed_y, speed_rot_z, mesh])
            }
            let new_data = []
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                let [speed_x, speed_y, speed_rot_z, mesh] = d;
                mesh.position.x += speed_x
                mesh.position.y += speed_y
                mesh.rotation.z += speed_rot_z
                if (mesh.position.distanceTo(Globals.camera.position) < 150000) {
                    new_data.push(d)
                } else {
                    Globals.scene.remove(mesh)
                }
            }
            this.data = new_data
        }
    }
}
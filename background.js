class Background {
    updateParams (uniforms) {
        let common = 1/this.width/this.coeff;
        uniforms.scale.value.x = Globals.width*common
        uniforms.scale.value.y = Globals.height*common
        uniforms.pos.value.x = Globals.camera.position.x*common
        uniforms.pos.value.y = Globals.camera.position.y*common
    }
    constructor () {
        let bg_list = [
            [
                "assets/4s.png",
                200,
                2.2,
                5723.9,
                25925.9
            ],
            [
                "assets/4.png",
                200,
                7.5,
                6000,
                56700
            ],
            [
                "assets/3.png",
                200,
                7.5,
                6000,
                56700
            ],
            [
                "assets/2.png",
                200,
                7.5,
                6000,
                56700
            ],
        ]

        let rnd = Utils.rnd("background.js precious seed " + Math.random())

        this.bg_params = bg_list[Math.floor(rnd()*bg_list.length)];
        let [bg_path, coeff, alpha, beta_1, beta_2] = this.bg_params;
        this.coeff = coeff;
        this.alpha = alpha;
        this.beta_1 = beta_1;
        this.beta_2 = beta_2;

        Globals.event.addListener("animate", () => {
            if (this.mesh !== undefined) {
                this.updateParams(this.mesh.material.uniforms)
                this.mesh.position.x = Globals.camera.position.x
                this.mesh.position.y = Globals.camera.position.y
            }
        });
        
        (async () => {
            let tex = await Globals.texture.get(bg_path)
            this.width = tex.image.width;
            this.height = tex.image.height;

            let geometry = new THREE.PlaneGeometry(Globals.width, Globals.height, 1, 1);
            let uniforms = {
                texture: { value: tex },
                far: { value: new THREE.Vector2(this.width * alpha, this.height * alpha) },
                dotvec: { value: new THREE.Vector2(beta_1*coeff, beta_2*coeff) },
                scale: {value: new THREE.Vector2()},
                pos: {value: new THREE.Vector2()}
            };
            this.updateParams(uniforms);
            let material = new THREE.RawShaderMaterial({
                uniforms: uniforms,
                vertexShader: Shaders.defaultVertexShader,
                fragmentShader: `
    precision mediump float;

    uniform sampler2D texture;
    uniform vec2 far;
    uniform vec2 dotvec;
    uniform vec2 scale;
    uniform vec2 pos;
    varying vec2 vUv;
    void main() {
    vec2 vUvS = vUv*scale + (-scale + 1.0)/2.0 + pos;
    float r = sin(dot(vUvS.xy, dotvec));
    vec2 v = fract(vec2(vUvS.x + r/far.x, vUvS.y + r/far.y));
    vec3 color = texture2D(texture, v).rgb*0.7 + 0.15;
    gl_FragColor = vec4(color, 1);
    }
    `,
                transparent: true,
            });

            let mesh = new THREE.Mesh(geometry, material);
            Globals.scene.add(mesh);

            mesh.position.z = 0

            this.mesh = mesh
            this.mesh.position.x = Globals.camera.position.x
            this.mesh.position.y = Globals.camera.position.y
        })();
    }
}
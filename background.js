class Background {
    updateParams (uniforms) {
        let common = 1/this.width/this.coeff;
        uniforms.scale.value.x = Globals.width*common
        uniforms.scale.value.y = Globals.height*common
        uniforms.pos.value.x = Globals.camera.position.x*common
        uniforms.pos.value.y = Globals.camera.position.y*common
    }
    constructor () {
        this.coeff = 200; // param
        this.alpha = 2.2;
        this.beta_1 = 5723.9;
        this.beta_2 = 25925.9;

        let coeff = this.coeff;
        let alpha = this.alpha;
        let beta_1 = this.beta_1;
        let beta_2 = this.beta_2;
        
        new THREE.TextureLoader().load( "assets/4.png", (tex) => {
            this.width = tex.image.width;
            this.height = tex.image.height;
            let geometry = new THREE.PlaneGeometry(Globals.width, Globals.height, 1, 1);
            let uniforms = {
                texture: { value: tex },
                far: { value: new THREE.Vector2(this.width*alpha, this.height*alpha) },
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
    vec3 color = texture2D(texture, v).rgb*0.8;
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
        } );

        Globals.event.addListener("animate", () => {
            if (this.mesh !== undefined) {
                this.updateParams(this.mesh.material.uniforms)
                this.mesh.position.x = Globals.camera.position.x
                this.mesh.position.y = Globals.camera.position.y
            }
        })
    }
}
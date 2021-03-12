class Background {
    constructor () {
        let coeff = 30; // param
        
        var map = new THREE.TextureLoader().load( "assets/4.png", (tex) => {
            let geometry = new THREE.PlaneGeometry(tex.image.width*coeff, tex.image.height*coeff, 1, 1);
            let material = new THREE.RawShaderMaterial({
                uniforms: {
                  texture: { value: tex }
                },
                vertexShader: `
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,
                fragmentShader: `
precision mediump float;

uniform sampler2D texture;
varying vec2 vUv;
void main() {
    vec3 color = texture2D(texture, vUv).rgb;
    gl_FragColor = vec4(color, 1);
}
`,
                transparent: true,
            });
    
            let mesh = new THREE.Mesh(geometry, material);
            Globals.scene.add(mesh);
    
            mesh.position.z = 0
        } );
    }
}
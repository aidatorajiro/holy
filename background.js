class Background {
    constructor () {
        let coeff = 30; // param
        let alpha = 2.2;
        let beta_1 = 5723.9;
        let beta_2 = 25925.9;
        
        var map = new THREE.TextureLoader().load( "assets/4.png", (tex) => {
            let geometry = new THREE.PlaneGeometry(tex.image.width*coeff, tex.image.height*coeff, 1, 1);
            let material = new THREE.RawShaderMaterial({
                uniforms: {
                  texture: { value: tex },
                  far: { value: new THREE.Vector2(tex.image.width*2.2, tex.image.height*2.2) },
                  dotvec: { value: new THREE.Vector2(beta_1*coeff, beta_2*coeff) }
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
uniform vec2 far;
uniform vec2 dotvec;
varying vec2 vUv;
void main() {
    //float r = fract(sin(dot(vUv.xy ,vec2(17.0,7.0))) * 10000.0);
    //float r = sin(dot(vUv.xy, vec2(171717.0,777777.0)));
    //float r = sin(dot(vUv.xy, vec2(sin(vUv.x * 10000.0) * 10000.0,sin(vUv.y * 10000.0) * 10000.0)));
    //float r = fract(sin(dot(vUv.xy, vec2(171717.0,777777.0))));
    float r = sin(dot(vUv.xy, dotvec));
    vec2 v = vec2(vUv.x + r/far.x, vUv.y + r/far.y);
    vec3 color = texture2D(texture, v).rgb;
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
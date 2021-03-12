class Background {
    constructor () {
        let coeff = 30; // param
        
        var map = new THREE.TextureLoader().load( "assets/4.png", (tex) => {
            let geometry = new THREE.PlaneGeometry(tex.image.width*coeff, tex.image.height*coeff, 1, 1);
            let material = new THREE.RawShaderMaterial({
                uniforms: {
                  texture: { value: tex },
                  far: { value: 300.0 },
                  dotvec: { value: new THREE.Vector2(171717.0, 777777.0) }
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
uniform float far;
uniform vec2 dotvec;
varying vec2 vUv;
void main() {
    //float r = fract(sin(dot(vUv.xy ,vec2(17.0,7.0))) * 10000.0);
    //float r = sin(dot(vUv.xy, vec2(171717.0,777777.0)));
    //float r = sin(dot(vUv.xy, vec2(sin(vUv.x * 10000.0) * 10000.0,sin(vUv.y * 10000.0) * 10000.0)));
    //float r = fract(sin(dot(vUv.xy, vec2(171717.0,777777.0))));
    float r = sin(dot(vUv.xy, dotvec));
    vec2 v = vec2(vUv.x + r/far, vUv.y + r/far);
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
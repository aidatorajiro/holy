class Textshow {
    constructor () {
        const fontSize = 32; // param
        const offset = 15; // param

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        // 44 characters (wrap length)
        const text = "ああああいいいいああああいいいいああああいいいいああああいいいいああああいいいいいいいい";
        const font = fontSize + "px NotoSans";
        ctx.font = font;
        const measureWidth = ctx.measureText(text);
        const width = measureWidth.width + offset*2;
        const height = fontSize + offset*2;
        canvas.width = width;
        canvas.height = height;
        ctx.font = font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'hanging';
        ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.fillText(text, offset, offset);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        console.log(texture);
        // TODO: dealloc canvas
        let geometry = new THREE.PlaneGeometry(width, height, 1, 1);
        let material = new THREE.RawShaderMaterial({
            uniforms: {
              texture: { value: texture }
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
    if (color.r > 0.9 && color.g > 0.9 && color.b > 0.9) {
        gl_FragColor = vec4(color, 1);
    } else {
        gl_FragColor = vec4(color, 0);
    }
}
`,
            transparent: true,
        });

        let mesh = new THREE.Mesh(geometry, material);
        Globals.scene.add(mesh);

        mesh.position.z = 1
    }
}
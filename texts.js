class Texts {
    constructor () {
        Globals.eventManagement.addListener("rawReadComplete", () => {
            this.write(Globals.raw.json[0])
        });
    }
    write (text, fontSize=32, charHeight=32, charWidth=32, offset=15, len=44) {
        let lines = text.split("\n")

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        // 44 characters (wrap length), 1408 pixels
        const font = fontSize + "px NotoSans";

        function change (x, y, n) {
            if (n > 0) {
                return [x.slice(0, -n), x.slice(-n) + y]
            } else if (n < 0) {
                n = -n;
                return [x + y.slice(0, n), y.slice(n)]
            } else {
                return [x, y]
            }
        }
        
        let segments = []

        for (let line of lines) {
            while (line.length !== 0) {
                let segment = line.slice(0, len)
                line = line.slice(len)
                segments.push(segment)
            }
        }

        const width = charWidth*len + offset*2;
        const height = segments.length*charHeight + offset*2;
        canvas.width = width;
        canvas.height = height;

        for (let segment of segments) {
            ctx.font = font;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'hanging';
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.fillText(segment, offset, offset);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

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
    gl_FragColor = texture2D(texture, vUv);
}
`,
            transparent: true,
        });

        let mesh = new THREE.Mesh(geometry, material);
        Globals.scene.add(mesh);

        mesh.position.z = 1
    }
}
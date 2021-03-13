class Texts {
    constructor () {
        Globals.eventManagement.addListener("rawReadComplete", () => {
            this.write(Globals.raw.json[0])
        });
    }
    write (text, fontSize=32, lineHeight=32, offset=15, len=44) {
        let lines = text.split("\n")

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        // 44 characters (wrap length), 1408 pixels
        const font = fontSize + "px NotoSans";
        const maxWidth = measure("あ".repeat(len));

        function measure (x) {
            ctx.font = font;
            return ctx.measureText(x).width;
        }

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
            while (true) {
                let segment = line.slice(0, len)
                let segmentWidth = measure(segment)
                line = line.slice(len)
                
                if (line.length !== 0) {
                    let amari = maxWidth - segmentWidth;
                    if (Math.abs(amari) >= fontSize) {
                        console.log("amari ga detayo")
                        console.log(amari)
                    }
                    segments.push(segment)
                } else {
                    segments.push(segment)
                    break
                }
            }
        }
        
        const width = maxWidth + offset*2;
        const height = segments.length*lineHeight + offset*2;
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
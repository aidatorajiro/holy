class Building {
    constructor (text) {
        this.pointPlots = []
        this.linkPlots = []
        this.segments = []
        this.write(text)
        this.makeLinkPlots()
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

        let segments = this.segments

        let regeps = [[/\$/g, 1], [/\%/g, 1], [/^#.#/g, 3], [/^#..#/g, 4], [/^#...#/g, 5]];

        for (let line of lines) {
            while (line.length !== 0) {
                let segment = line.slice(0, len)
                line = line.slice(len)
                // TODO: change script
                for (let r of regeps) {
                    let matches = [...segment.matchAll(r[0])]
                    for (let m of matches) {
                        this.pointPlots.push([m[0], segments.length, m.index])
                    }
                }
                for (let r of regeps) {
                    segment = segment.replace(r[0], "　".repeat(r[1]))
                }
                segments.push(segment)
            }
        }

        const width = charWidth*len + offset*2;
        const height = segments.length*charHeight + offset*2;
        canvas.width = width;
        canvas.height = height;

        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i]
            ctx.font = font;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'hanging';
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.fillText(segment, offset, offset + i*charHeight);
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

    makeLinkPlots () {
        let child_process = require('child_process')
        let child = child_process.spawn("/usr/local/bin/mecab")
        function analyze (x) {
            child.stdin.write(x + "\n")
            return new Promise(function (res, rej) {
                child.stdout.on("data", (data) => {
                    res(data)
                })
            })
        }

        (async () => {
            let type, last_type, word, desc;
            let tray = "";
            let lst = {};
            for (let i = 0; i < this.segments.length; i++) {
                let segment = this.segments[i];
                let res = String(await analyze(segment));
                for (let s of res.split("\n")) {
                    if (s === 'EOS' || s === '') {
                        continue;
                    }
                    [word, desc] = s.split("\t")
                    type = desc.split(",")[0]
                    if (type === last_type || last_type === undefined) {
                        tray += word
                    } else if (tray !== '') {
                        if (last_type !== '記号') {
                            if (lst[tray] === undefined) {
                                lst[tray] = [last_type, []]
                            }
                            lst[tray][1].push(i)
                        }
                        tray = ''
                    }
                    last_type = type;
                }
            }
            console.log(lst)
            child.stdin.end()
        })();
    }
}
class Building {
    constructor (text) {
        this.pointPlots = []
        this.trayToPos = {}
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

    async makeLinkPlots () {
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

        let type, last_type, word, desc, x;
        let last_x = 0;
        let last_y = 0;
        let tray = "";
        let trayToPos = {};

        for (let y = 0; y < this.segments.length; y++) {
            x = 0
            let segment = this.segments[y];
            let res = String(await analyze(segment));
            for (let s of res.split("\n")) {
                if (s === 'EOS' || s === '') {
                    continue;
                }
                [word, desc] = s.split("\t")
                type = desc.split(",")[0]
                if (type === last_type || last_type === undefined) {
                    tray += word
                    x += word.length
                } else if (tray !== '') {
                    if (last_type !== '記号') {
                        if (trayToPos[tray] === undefined) {
                            trayToPos[tray] = [last_type, []]
                        }
                        let lst = trayToPos[tray][1]
                        lst.push([last_x, last_y, x, y])
                    }
                    tray = ''
                    last_x = x
                    last_y = y
                }
                last_type = type;
            }
        }

        this.trayToPos = trayToPos

        let linkPlots = Object.entries(trayToPos)
            .filter((x) => (x[0].length > 1 && x[1][1].length > 1))
            .sort((x, y) => (y[1][1].length - x[1][1].length))

        this.linkPlots = linkPlots

        child.stdin.end()
    }
}
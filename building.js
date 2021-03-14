class Building {
    constructor (text, x, y, len) {
        this.len = len
        this.x = x
        this.y = y
        this.textMesh = undefined;
        this.linkMeshes = [];
        this.pointPlots = [];
        this.trayToPos = {};
        this.linkPlots = [];
        this.segments = [];
        this.fontSize = 32;
        this.charHeight = 32;
        this.charWidth = 32;
        this.offset = 15;
        this.write(text);
        this.drawPointPlots();
        (async () => {
            await this.prepareLinkPlots();
            this.drawLinkPlots();
        })();
    }

    write (text) {
        let fontSize = this.fontSize
        let charHeight = this.charHeight
        let charWidth = this.charWidth
        let offset = this.offset

        let len = this.len
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
            vertexShader: Shaders.defaultVertexShader,
            fragmentShader: Shaders.defaultFragmentShader,
            transparent: true,
        });

        let mesh = new THREE.Mesh(geometry, material);
        Globals.scene.add(mesh);

        mesh.position.z = 1
        mesh.position.x = this.x
        mesh.position.y = this.y

        this.textmesh = mesh
    }

    drawPointPlots () {
    }

    async prepareLinkPlots () {
        let child = Preload.spawnMecab();

        let resolve = (_) => {}, reject = (_) => {};

        let decoder = new TextDecoder();

        Preload.getOutput(child, (data) => {
            resolve(decoder.decode(data))
        })

        Preload.getError(child, (data) => {
            reject(decoder.decode(data))
        })

        // analyze text via mecab 0.996

        function analyze (x) {
            Preload.writeTo(child, x + "\n")
            return new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            })
        }

        try {
            // parse mecab output to generate trayToPos
            // trayToPos is a hashmap that maps trays to the positions of them in the text.
            // trays are combinations of words, calculated from the mecab output. 
            // consecutive words with the same type (e.g. verb, noun, adjunction etc) form a tray.
            // the position of a tray is represented by [start x pos, start y pos, end x pos, end y pos]
            // for example, a corpse
            // 1 2 3 a
            // b c A B
            // C a b c
            // will generate {123: [[0, 0, 2, 0]], abc: [[3, 0, 1, 1], [1, 2, 3, 2]], ABC: [[2, 1, 0, 2]]}

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

            // filter trayToPos to obtain linkPlots
            // linkPlots is the array to register visual links between trays

            let linkPlots = Object.entries(trayToPos)
                .filter((x) => (x[0].length > 1 && x[1][1].length > 1))
                .sort((x, y) => (y[1][1].length - x[1][1].length))

            this.linkPlots = linkPlots
        } finally {
            Preload.endInput(child)
        }
    }

    drawLink (seed, start, end) {
        let r = Utils.rnd(seed)
        new THREE.TextureLoader().load( "assets/yari.png", (texture) => {
            let width = 1000;
            let geometry = new THREE.PlaneGeometry(width, texture.image.height, 1, 1);
            let material = new THREE.RawShaderMaterial({
                uniforms: {
                  texture: { value: texture },
                  coeff: { value: width / texture.image.width },
                  color: { value: new THREE.Vector4(r(), r(), r(), r() * 0.5) },
                  repeat: { value: new THREE.Vector4(r()-0.5, r()-0.5, r()-0.5, r()-0.5) }
                },
                vertexShader: Shaders.defaultVertexShader,
fragmentShader: `
precision mediump float;
uniform sampler2D texture;
uniform vec4 repeat;
uniform vec4 color;
uniform float coeff;
varying vec2 vUv;
void main() {
    float x0 = vUv.x*coeff;
    vec4 n = cos(vec4(x0, x0, x0, x0)*vec4(1.0, 2.0, 3.0, 4.0))*repeat;
    float x1 = fract(x0 + n.x + n.y +  n.z +  n.w);
    gl_FragColor = texture2D(texture, vec2(x1, vUv.y));
    gl_FragColor *= color;
}
`,
                transparent: true,
            });

            let mesh = new THREE.Mesh(geometry, material);
            Globals.scene.add(mesh);

            mesh.position.x = (start[0] + end[0])/2
            mesh.position.y = (start[1] + end[1])/2
            mesh.rotation.z = Math.atan2(end[1] - start[1], end[0] - start[0])
            mesh.position.z = 2

            this.linkMeshes.push(mesh)
        });
    }

    drawLinkPlots () {
        let ox = this.x + this.offset;
        let oy = this.y + this.offset;
        let convert = (params) => {
            let [x1, y1, x2, y2] = params;
            let x1c = ox + x1*this.charWidth
            let y1c = oy + y1*this.charHeight
            let x2c = ox + x2*this.charWidth 
            let y2c = oy + y2*this.charHeight
            return [x1c, y1c, x2c, y2c];
        }
        for (let [name, type_posList] of this.linkPlots) {
            let [type, posList] = type_posList
            for (let i = 0; i < posList.length - 1; i++) {
                let pos_start = posList[i];
                let pos_end = posList[i + 1];
                
                let [sx1, sy1, sx2, sy2] = convert(pos_start);
                let [ex1, ey1, ex2, ey2] = convert(pos_end);

                this.drawLink(type+name, [sx1, sy1], [ex1, ey1])
            }
        }
    }
}
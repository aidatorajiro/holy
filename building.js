class Building {
    constructor (text, lineCharLimit=44, fontSize=32, charHeight=32, charWidth=32, offset=15, canvas_lines=100) {
        // texts
        this.canvas_lines = canvas_lines
        this.width = undefined
        this.height = undefined
        this.lineCharLimit = lineCharLimit
        this.segments = [];
        this.fontSize = fontSize;
        this.charHeight = charHeight;
        this.charWidth = charWidth;
        this.offset = offset;
        this.newlines = new Set();
        this.processedText = undefined;

        // Dynvas
        this.dynvases = new DynamicCache();

        // Trays
        this.linkMeshes = [];
        this.linkPlots = [];
        this.trayToPos = {};

        // points
        this.pointMeshes = [];
        this.pointPlots = [];

        // text
        this.text = text
    }

    preprocess () {
        this.processText();
        this.calculateHeight();
    }

    draw (x, y) {
        this.x = x
        this.y = y
        this.drawText();
        this.drawPointPlots();
        (async () => {
            await this.prepareLinkPlots();
            this.drawLinkPlots();
        })();
    }

    update () {
        this.dynvases.update()
    }

    /*
    move (x, y) {
        [...this.linkMeshes, ...this.pointMeshes].map(
            (o) => {o.translateX(x); o.translateY(y);}
        );
        this.dynvases.map(
            (o) => {o.move(x, y);}
        );
        this.x += x;
        this.y += y;
    }*/

    clear () {
        [...this.linkMeshes, ...this.pointMeshes].map(
            (o) => {Globals.scene.remove(o)}
        );
        this.dynvases.clear()
        this.linkMeshes = []
        this.pointMeshes = []
    }

    processText () {
        let text = this.text;
        let len = this.lineCharLimit

        let lines = text.split("\n")

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

        let regeps = [[/\$/gm, "　"], [/\%/gm, "　"], [/^#.#/gm, "　　　"], [/^#..#/gm, "　　　　"], [/^#...#/gm, "　　　　　"]];

        for (let line of lines) {
            while (line.length !== 0) {
                let segment = line.slice(0, len)
                line = line.slice(len)
                // TODO: change script
                for (let r of regeps) {
                    let matches = [...segment.matchAll(r[0])]
                    for (let m of matches) {
                        this.pointPlots.push([m[0], m.index, segments.length])
                    }
                }
                for (let r of regeps) {
                    segment = segment.replace(r[0], r[1])
                }
                segments.push(segment)
            }
            this.newlines.add(segments.length - 1)
        }

        this.processedText = text
        for (let r of regeps) {
            this.processedText = this.processedText.replace(r[0], r[1])
        }
    }

    calculateHeight () {
        const charWidth = this.charWidth
        const segments = this.segments
        const offset = this.offset
        const whole_height = this.heightFrom(segments.length);
        const width = charWidth * this.lineCharLimit + offset*2;
        this.width = width;
        this.height = whole_height;
    }

    heightFrom (l) {
        return l * this.charHeight + this.offset*2;
    }

    drawText () {
        const segments = this.segments
        const width = this.width
        const offset = this.offset

        // 44 characters (wrap length), 1408 pixels
        const fontSize = this.fontSize
        const font = fontSize + "px NotoSans";

        const start_y = this.y + this.height / 2;
        let current_y = start_y;

        for (let j = 0; j < segments.length; j += this.canvas_lines) {
            let slice = segments.slice(j, j + this.canvas_lines);

            const height = this.heightFrom(slice.length);

            let dynvas = new Dynamic(this.x, current_y - height / 2, width, height);

            dynvas.event.addListener("create", (ev) => {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext('2d');

                canvas.width = width;

                canvas.height = height;

                for (let i = 0; i < slice.length; i++) {
                    let segment = slice[i]
                    ctx.font = font;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'hanging';
                    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
                    ctx.fillText(segment, offset, offset + i*this.charHeight);
                }

                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = false;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.format = THREE.RGBAFormat;

                let geometry = new THREE.PlaneGeometry(width, height, 1, 1);
                let material = new THREE.RawShaderMaterial({
                    uniforms: {
                      texture: { value: texture }
                    },
                    vertexShader: Shaders.defaultVertexShader,
                    fragmentShader: `
precision mediump float;
uniform sampler2D texture;
varying vec2 vUv;
void main() {
    gl_FragColor = texture2D(texture, vUv);
    gl_FragColor.a *= 0.4;
}
`,
                    transparent: true,
                });
                let mesh = new THREE.Mesh(geometry, material);
                Globals.scene.add(mesh);

                let xyvec = new THREE.Vector2();

                ev.box.getCenter(xyvec);

                mesh.position.z = 4
                mesh.position.x = xyvec.x
                mesh.position.y = xyvec.y

                ev.mesh = mesh
            });

            /*dynvas.event.addListener("move", ([obj, x, y]) => {
                if (obj.mesh !== undefined) {
                    obj.mesh.translateX(x)
                    obj.mesh.translateY(y)
                }
            })*/

            dynvas.event.addListener("remove", (obj) => {
                Globals.scene.remove(obj.mesh)
            })

            this.dynvases.add(dynvas);

            current_y -= height - offset*2;
        }
    }

    // convert character position to scene position
    convert (x, y) {
        let ox = this.offset - this.width/2;
        let oy = this.offset + this.height/2;
        let xc = ox + x*this.charWidth
        let yc = oy - (y + 1)*this.charHeight
        return [xc, yc];
    }

    async drawPoint (r, asset, x, y, base_scale = 1, base_offset_x = 0, base_offset_y = 0, min_alpha = 0.2) {
        let texture = await Globals.texture.get(asset);
        let geometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height, 1, 1);
        let material = new THREE.RawShaderMaterial({
            uniforms: {
                texture: { value: texture },
                color: { value: new THREE.Vector4(r(), r(), r(), Math.min(1.0, r() + min_alpha)) }
            },
            vertexShader: Shaders.defaultVertexShader,
            fragmentShader: `
precision mediump float;
uniform sampler2D texture;
uniform vec4 color;
varying vec2 vUv;
void main() {
gl_FragColor = texture2D(texture, vUv);
gl_FragColor *= color;
}
`,
            transparent: true,
        });

        let mesh = new THREE.Mesh(geometry, material);
        Globals.scene.add(mesh);

        mesh.position.x = this.x + x + base_offset_x
        mesh.position.y = this.y + y + base_offset_y
        mesh.position.z = 2
        mesh.scale.x = base_scale * (1 + r()*0.1)
        mesh.scale.y = base_scale * (1 + r()*0.1)
        mesh.rotation.z = r() * 0.3

        this.pointMeshes.push(mesh)
    }

    drawPointPlots () {
        let ruby_seeds = {};
        let o = this.fontSize / 2;
        for (let [t, x, y] of this.pointPlots) {
            let seed = t+x+","+y;
            if (t === '%' || t === '$') {
                if (ruby_seeds[t] === undefined) {
                    ruby_seeds[t] = seed
                } else {
                    seed = ruby_seeds[t]
                    ruby_seeds[t] = undefined
                }
            }
            let r = Utils.rnd(seed);
            let [cx, cy] = this.convert(x, y);
            if (t === '%') {
                this.drawPoint(r, "assets/nn.png", cx, cy, 1.5, o, -o)
            }
            if (t === '$') {
                this.drawPoint(r, "assets/mm.png", cx, cy, 1.5, o, -o)
            }
            if (t === '#p#') {
                this.drawPoint(r, "assets/conv/p1.png", cx, cy, 0.4, o, -o)
            }
            if (t === '#i#') {
                this.drawPoint(r, "assets/conv/p3.png", cx, cy, 0.4, o, -o)
            }
            if (t === '#a#') {
                this.drawPoint(r, "assets/conv/p5.png", cx, cy, 0.4, o, -o)
            }
            let m = t.match(/#s(\d+)#/)
            if (m) {
                let n = parseInt(m[1])
                this.drawPoint(r, "assets/conv/p2." + n + ".png", cx, cy, 0.3, o, -o)
            }
        }
    }

    async prepareLinkPlots () {
        let child = Preload.spawnMecab();

        let decoder = new TextDecoder();

        // analyze text via mecab 0.996

        function analyze (x) {
            Preload.writeTo(child, x + "\n")
            Preload.endInput(child)
            return new Promise(function (res, rej) {
                let succ = "";
                let fail = "";
                Preload.onExit(child, (code) => {
                    if (code === 0) {
                        res(succ)
                    } else {
                        rej(fail)
                    }
                })
                Preload.getOutput(child, (data) => {
                    succ += data
                })
                Preload.getError(child, (data) => {
                    fail += data
                })
            })
        }

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

        let trayToPos = {}

        let result = await analyze(this.processedText);

        let last_type = undefined;

        let tray = undefined;

        let start_x = 0;

        let start_y = 0;

        let x = 0;

        let y = 0;

        let combination = 0;

        for (let r of result.split('\n')) {

            if (r === 'EOS') {
                //dosomething
                last_type = undefined
                continue
            }
            if (r === '') {
                continue
            }
            let [word, description] = r.split('\t')
            let type = description.split(',')[0]

            if (last_type === type) {
                tray += word
                combination += 1;
            } else {
                if (combination > 1 && last_type !== undefined && last_type !== '記号') {
                    if (trayToPos[tray] === undefined) {
                        trayToPos[tray] = [last_type, []]
                    }
                    trayToPos[tray][1].push([start_x, start_y])
                }
                combination = 1;
                tray = word
                start_x = x
                start_y = y
            }

            last_type = type;

            //console.log(x, y, tray, word, type)

            x += word.length

            if (x > this.segments[y].length - 1) {
                x -= this.segments[y].length
                y += 1
                if (this.segments[y] === undefined) {
                    break
                }
            }
            
        }

        this.trayToPos = trayToPos

        // filter trayToPos to obtain linkPlots
        // linkPlots is the array to register visual links between trays

        let linkPlots = Object.entries(trayToPos)
            .filter((x) => (x[0].length > 1 && x[1][1].length > 1))
            .sort((x, y) => (y[1][1].length - x[1][1].length))

        // TODO: somehow randomize link priority (e.g. shuffle this.linkPlots)

        this.linkPlots = linkPlots
    }

    async drawLink (r, asset, start, end) {
        let texture = await Globals.texture.get(asset);
        let d = (x, y) => (Math.sqrt(x*x + y*y))
        let width = d(start[0] - end[0], start[1] - end[1])
        let height = texture.image.height;
        let lx = this.x + (start[0] + end[0])/2;
        let ly = this.y + (start[1] + end[1])/2;
        let dynvas = new Dynamic(lx, ly, Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1]));
        
        dynvas.event.addListener("create", async (ev) => {
            let geometry = new THREE.PlaneGeometry(width, height, 1, 1);
            let material = new THREE.RawShaderMaterial({
                uniforms: {
                    texture: { value: texture },
                    coeff: { value: width / texture.image.width },
                    color: { value: new THREE.Vector4(r(), r(), r(), 0.4) },
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
    
            mesh.position.x = this.x + (start[0] + end[0])/2
            mesh.position.y = this.y + (start[1] + end[1])/2
            mesh.rotation.z = Math.atan2(end[1] - start[1], end[0] - start[0])
            mesh.position.z = 2
    
            ev.mesh = mesh
        });
        /*dynvas.event.addListener("move", ([obj, x, y]) => {
            if (obj.mesh !== undefined) {
                obj.mesh.translateX(x)
                obj.mesh.translateY(y)
            }
        })*/
        dynvas.event.addListener("remove", (obj) => {
            Globals.scene.remove(obj.mesh)
        })
        this.dynvases.add(dynvas)
    }

    drawLinkPlots () {
        let conv_table = {
            "名詞": ["assets/conv/y2.png", "assets/conv/y3.png", "assets/conv/y7.png"],
            "助動詞": ["assets/conv/y5.png"],
            "助詞": ["assets/conv/y6.png"],
            "動詞": ["assets/conv/y1.png", "assets/conv/y4.png"],
            "otherwise": ["assets/yari.png"]
        }
        let links_remain = Math.floor(this.segments.length * 2.5);
        
        for (let j = 0; j < this.linkPlots.length; j++) {
            let [name, type_posList] = this.linkPlots[j]
            let [type, posList] = type_posList
            links_remain -= posList.length;
            if (links_remain < 0) {
                break;
            }
            for (let i = 0; i < posList.length - 1; i++) {
                let [sx, sy] = posList[i];
                let [ex, ey] = posList[i + 1];

                let [csx, csy] = this.convert(sx, sy);
                let [cex, cey] = this.convert(ex, ey);

                let dist = Math.sqrt((sx - ex)*(sx - ex) + (sy - ey)*(sy - ey));

                let distlim = 1000

                if (dist <= distlim) {
                    this.drawPoint(Utils.rnd(String(j)+type+name), "assets/point.png", csx, csy)
                    let r = Utils.rnd(type+name);
                    let l = conv_table[type] || conv_table["otherwise"];
                    this.drawLink(r, l[Math.floor(r()*l.length)], [csx, csy], [cex, cey])
                }

                if (i === posList.length - 2 || dist > distlim) {
                    this.drawPoint(Utils.rnd(String(j)+type+name), "assets/point.png", cex, cey)
                }
            }
        }
    }
}
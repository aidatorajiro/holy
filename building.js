class Building {
    constructor (text, x, y, len=44, fontSize=32, charHeight=32, charWidth=32, offset=15) {
        // texts
        this.width = undefined
        this.height = undefined
        this.len = len
        this.x = x
        this.y = y
        this.textMesh = undefined;
        this.segments = [];
        this.fontSize = fontSize;
        this.charHeight = charHeight;
        this.charWidth = charWidth;
        this.offset = offset;
        this.newlines = new Set();
        this.processedText = undefined;

        // Trays
        this.linkMeshes = [];
        this.linkPlots = [];
        this.trayToPos = {};

        // points
        this.pointPlots = [];
        this.pointMeshes = []

        // function
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

        let regeps = [[/\$/gm, "　"], [/\%/gm, "　"], [/^#.#/gm, "　　　"], [/^#..#/gm, "　　　　"], [/^#...#/gm, "　　　　　"]];

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

        const width = charWidth*len + offset*2;
        const height = segments.length*charHeight + offset*2;
        canvas.width = width;
        canvas.height = height;
        this.width = width;
        this.height = height;

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

        this.textMesh = mesh
    }

    // convert character position to scene position
    convert (x, y) {
        let ox = this.x + this.offset - this.width/2;
        let oy = this.y - this.offset + this.height/2;
        let xc = ox + x*this.charWidth
        let yc = oy - y*this.charHeight
        return [xc, yc];
    }

    drawPoint (r, asset, x, y) {
        new THREE.TextureLoader().load( asset, (texture) => {

            let geometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height, 1, 1);
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

            mesh.position.x = x
            mesh.position.y = y
            mesh.position.z = 2

            this.pointMeshes.push(mesh)
        });
    }

    drawPointPlots () {
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
                    console.log("warning: y overflowed before EOS", this)
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

        this.linkPlots = linkPlots
    }

    drawLink (r, asset, start, end) {
        new THREE.TextureLoader().load( asset, (texture) => {
            let d = (x, y) => (Math.sqrt((x-y)*(x-y)))
            let width = d(start[0] - end[0], start[1] - end[1])
            let geometry = new THREE.PlaneGeometry(width, texture.image.height, 1, 1);
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

            mesh.position.x = (start[0] + end[0])/2
            mesh.position.y = (start[1] + end[1])/2
            mesh.rotation.z = Math.atan2(end[1] - start[1], end[0] - start[0])
            mesh.position.z = 2

            this.linkMeshes.push(mesh)
        });
    }

    drawLinkPlots () {
        let conv_table = {
            "名詞": ["assets/conv/y2.png", "assets/conv/y3.png", "assets/conv/y7.png"],
            "助動詞": ["assets/conv/y5.png"],
            "助詞": ["assets/conv/y6.png"],
            "動詞": ["assets/conv/y1.png", "assets/conv/y4.png"],
            "otherwise": ["assets/yari.png"]
        }
        //let [a1, a2] = this.convert(5, 5);
        //let [a3, a4] = this.convert(7, 130);
        //this.drawLink("あああああ", "assets/yari.png", [a1, a2], [a3, a4])
        //this.drawPoint("あああああ", "assets/point.png", a1, a2)
        //this.drawPoint("あああああ", "assets/point.png", a3, a4)
        for (let j = 0; j < this.linkPlots.length - 1; j++) {
            let [name, type_posList] = this.linkPlots[j]
            let [type, posList] = type_posList
            for (let i = 0; i < posList.length - 1; i++) {
                let [sx, sy] = posList[i];
                let [ex, ey] = posList[i + 1];
                
                [sx, sy] = this.convert(sx, sy);
                [ex, ey] = this.convert(ex, ey);

                if (j < 10) {
                    this.drawPoint(Utils.rnd(String(j)+type+name), "assets/point.png", sx, sy)
                }

                let r = Utils.rnd(type+name);
                let l = conv_table[type] || conv_table["otherwise"];
                this.drawLink(r, l[Math.floor(r()*l.length)], [sx, sy], [ex, ey])
            }
        }
    }
}
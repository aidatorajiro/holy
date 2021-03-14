wow=require("./out.small.json");1;

fontSize=32
charHeight=32
charWidth=32
offset=15

        let len = 44

text = wow[0];1;

        let lines = text.split("\n")

        segments = []
        
        pointPlots = []

        let regeps = [[/\$/g, 1], [/\%/g, 1], [/^#.#/g, 3], [/^#..#/g, 4], [/^#...#/g, 5]];

        for (let line of lines) {
            while (line.length !== 0) {
                let segment = line.slice(0, len)
                line = line.slice(len)
                // TODO: change script
                for (let r of regeps) {
                    let matches = [...segment.matchAll(r[0])]
                    for (let m of matches) {
                        pointPlots.push([m[0], segments.length, m.index])
                    }
                }
                for (let r of regeps) {
                    segment = segment.replace(r[0], "　".repeat(r[1]))
                }
                segments.push(segment)
            }
        }
        
   x= (async () => {
     let child_process = require('child_process')
        let child = child_process.spawn("mecab")

        let resolve = (_) => {}, reject = (_) => {};

        child.stdout.on("data", (data) => {
            resolve(data)
        })

        child.stderr.on("data", (data) => {
            reject(data)
        })

        // analyze text via mecab 0.996

        function analyze (x) {
            child.stdin.write(x + "\n")
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

            for (let y = 0; y < segments.length; y++) {
                x = 0
                let segment = segments[y];
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

            trayToPos = trayToPos

            // filter trayToPos to obtain linkPlots
            // linkPlots is the array to register visual links between trays

            let linkPlots = Object.entries(trayToPos)
                .filter((x) => (x[0].length > 1 && x[1][1].length > 1))
                .sort((x, y) => (y[1][1].length - x[1][1].length))

            linkPlots = linkPlots
        } finally {
            child.stdin.end()
        }
    })

x().then(_=>{console.log("ok!")})
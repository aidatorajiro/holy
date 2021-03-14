let Globals = {}

class Game {

    constructor () {
        Globals.width = window.innerWidth;
        Globals.height = window.innerHeight;

        // camera / scene / renderer preparation
        Globals.camera = new THREE.OrthographicCamera( -Globals.width / 2, Globals.width / 2, Globals.height / 2, -Globals.height / 2, 1, 2000 );
        Globals.camera.position.z = 500;

        Globals.scene = new THREE.Scene()

        Globals.renderer = new THREE.WebGLRenderer({ antialias: true })
        Globals.renderer.setSize(Globals.width, Globals.height)
        Globals.renderer.setClearColor( 0, 1 );
        document.body.appendChild(Globals.renderer.domElement)

        // construct objects
        Globals.event = new EventManagement()
        Globals.processManagement = new ProcessManagement()
        Globals.coordinator = new Coordinator()
        Globals.raw = new Raw()
        Globals.background = new Background()

        // prepare kuromoji
        kuromoji.builder({
            dicPath: './node_modules/kuromoji/dict'
        }).build(function(err, tokenizer) {
            if(err) { throw err; }
            Globals.tokenizer = tokenizer
        });

        // sample building
        Globals.raw.event.addListener("load", (raw) => {
            Globals.sample_building = new Building(raw.json[0], 0, 0, 44)
        });

        // first frame: call animate func
        requestAnimationFrame((time) => {

            let windowEvents = ['resize', 'mousedown', 'mouseup', 'keydown', 'keyup', 'beforeunload']

            for (let name of windowEvents) {
                window.addEventListener(name, function (ev) {
                    Globals.event.runEvent(name, ev)
                }, false)
            }

            Globals.event.addListener('resize', this.resize)

            this.animate(time)
        })
    }

    resize () {
        Globals.width = window.innerWidth;
        Globals.height = window.innerHeight;
        Globals.renderer.setSize(Globals.width, Globals.height)
        Globals.camera.left = Globals.width / -2
        Globals.camera.right = Globals.width / 2
        Globals.camera.top = Globals.height / 2
        Globals.camera.bottom = Globals.height / -2
        Globals.camera.updateProjectionMatrix()
    }

    animate (time) {
        requestAnimationFrame((time) => {
            this.animate(time)
        })

        if (Globals.time === undefined) {
            Globals.delta = 1000 / 60 // fallback delta value
            Globals.time = time
        } else {
            Globals.delta = time - Globals.time
            Globals.time = time
        }

        Globals.event.runEvent('animate', {delta: Globals.delta, time: time})

        Globals.renderer.render( Globals.scene, Globals.camera );
    }

}

window.addEventListener("load", function () {
    Globals.game = new Game()
});
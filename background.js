class Background {
    constructor () {
        var map = new THREE.TextureLoader().load( "assets/4.png", (tex) => {
            const w = 10000;
            const h = tex.image.height / (tex.image.width / w);
            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshBasicMaterial( { map:map } );
            const plane = new THREE.Mesh( geometry, material );
            plane.scale.set(w, h, 1);
            Globals.scene.add( plane );
            plane.position.x = 0;
            plane.position.y = 0;
            plane.position.z = 0;
        } );
    }
}
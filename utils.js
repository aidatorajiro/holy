let Utils = {
    textureFromImage: function (src) {
        return new Promise(function (res, rej) {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let im = document.createElement("img");
            im.src = src;
            im.addEventListener('load', function (e) {
                canvas.width = this.width;
                canvas.height = this.height;
                ctx.drawImage(im, 0, 0);
                res(canvas);
            })
        });
    }
}
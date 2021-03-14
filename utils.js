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
    },
    rnd: function (str) {
        let seed = this.xmur3(str);
        return this.mulberry32(seed())
    },
    mulberry32: function (a) {
        return function() {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    },
    xmur3: function (str) {
        str = new TextEncoder().encode(str); // or Buffer.from
        for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
            h = Math.imul(h ^ str[i], 3432918353);
            h = h << 13 | h >>> 19;
        }
        return function() {
            h = Math.imul(h ^ h >>> 16, 2246822507),
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }
}
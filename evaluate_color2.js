const assert = require('node:assert');
function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) { factor = 0.5; }
    color1 = color1.replace(/^#/, '');
    color2 = color2.replace(/^#/, '');
    let c1 = color1.match(/.{1,2}/g);
    let c2 = color2.match(/.{1,2}/g);
    let hex = function(x) {
        x = x.toString(16);
        return (x.length == 1) ? '0' + x : x;
    };
    let r = Math.round(parseInt(c1[0], 16) * (1 - factor) + parseInt(c2[0], 16) * factor);
    let g = Math.round(parseInt(c1[1], 16) * (1 - factor) + parseInt(c2[1], 16) * factor);
    let b = Math.round(parseInt(c1[2], 16) * (1 - factor) + parseInt(c2[2], 16) * factor);
    return "#" + hex(r) + hex(g) + hex(b);
}
console.log(interpolateColor('#8B4513', '#228B22', 0.25).toUpperCase());
console.log(interpolateColor('#8B4513', '#228B22', 0.5).toUpperCase());
console.log(interpolateColor('#8B4513', '#228B22', 0.75).toUpperCase());

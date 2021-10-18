psys = new ParticleSystem();
psys.randomize();

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

bgColor = 'hsl(0, 0%, 75%)';

mouse = {x: 0, y: 0};
document.onmousemove = function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
}

var btn = $ ('#bg-color-picker')[0];
var picker = new ColorPicker(btn, bgColor);
btn.addEventListener('colorChange', function(event) {
    bgColor = event.detail.color.rgb;
});
for (var i = 1; i <= 3; i++) {
    var btn = $ (`#color${i}-picker`)[0];
    const c = i-1;
    var picker = new ColorPicker(btn, psys.color[c]);
    btn.addEventListener('colorChange', function(event) {
        psys.color[c] = new Color(event.detail.color.rgb);
    });
}

$ ('#count')[0].value = psys.count;
$ ('#left')[0].value = psys.emitter.left;
$ ('#right')[0].value = psys.emitter.right;
$ ('#top')[0].value = psys.emitter.top;
$ ('#bottom')[0].value = psys.emitter.bottom;
$ ('#life-min')[0].value = psys.lifeMin;
$ ('#life-max')[0].value = psys.lifeMax;
$ ('#alpha1')[0].value = psys.alpha[0];
$ ('#alpha2')[0].value = psys.alpha[1];
$ ('#alpha3')[0].value = psys.alpha[2];
$ ('#gravity')[0].value = psys.gravity;
$ ('#gravity-direction')[0].value = psys.gravityDirection;
$ ('#size-min')[0].value = psys.size.min;
$ ('#size-max')[0].value = psys.size.max;
$ ('#size-incr')[0].value = psys.size.incr;
$ ('#size-wiggle')[0].value = psys.size.wiggle;
$ ('#speed-min')[0].value = psys.speed.min;
$ ('#speed-max')[0].value = psys.speed.max;
$ ('#speed-incr')[0].value = psys.speed.incr;
$ ('#speed-wiggle')[0].value = psys.speed.wiggle;
$ ('#direction-min')[0].value = psys.direction.min;
$ ('#direction-max')[0].value = psys.direction.max;
$ ('#direction-incr')[0].value = psys.direction.incr;
$ ('#direction-wiggle')[0].value = psys.direction.wiggle;
$ ('#orientation-min')[0].value = psys.orientation.min;
$ ('#orientation-max')[0].value = psys.orientation.max;
$ ('#orientation-incr')[0].value = psys.orientation.incr;
$ ('#orientation-wiggle')[0].value = psys.orientation.wiggle;
$ ('#fps')[0].value = psys.fps;
$ ('#burst-particles')[0].value = psys.burstParticles;

document.addEventListener('keydown', function(event) {
    if (event.key == ' ') {
        psys.burst(mouse.x - (canvas.width/2 - 400), mouse.y - (canvas.height/2 - 304));
    }
});

function updateShape() {
    var name = "";
    switch (psys.shape) {
        case 1: name = "Pixel"; break;
        case 2: name = "Disk"; break;
        case 3: name = "Square"; break;
        case 4: name = "Line"; break;
        case 5: name = "Star"; break;
        case 6: name = "Circle"; break;
        case 7: name = "Ring"; break;
        case 8: name = "Sphere"; break;
        case 9: name = "Flare"; break;
        case 10: name = "Spark"; break;
        case 11: name = "Explosion"; break;
        case 12: name = "Cloud"; break;
        case 13: name = "Smoke"; break;
        case 14: name = "Snow"; break;
    }
    $ ('#shape-name')[0].innerHTML = name;
}

function setColors(n) {
    psys.colors = n;
    $ ('.colors .option.active')[0].classList.remove('active');
    $ (`[name="${n} colors"]`)[0].classList.add('active');
}

function switchBlending() {
    if (psys.additive) {
        $ ('#additive')[0].classList.remove('active');
    }
    else {
        $ ('#additive')[0].classList.add('active');
    }
    psys.additive = !psys.additive;
}

function setAlphas(n) {
    psys.alphas = n;
    $ ('.alphas .option.active')[0].classList.remove('active');
    $ (`[name="${n} alphas"]`)[0].classList.add('active');
}

function update() {
    updateUI(false);

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    draw();
}

function updateUI(full) {
    $ ("#bg-color-display")[0].style["background-color"] = bgColor;
    $ ("#color1-display")[0].style["background-color"] = psys.color[0];
    $ ("#color2-display")[0].style["background-color"] = psys.color[1];
    $ ("#color3-display")[0].style["background-color"] = psys.color[2];

    if (full) {
        setAlphas(psys.alphas);
        setColors(psys.colors);
        switchBlending();
        switchBlending();
    }
}

function draw() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.resetTransform();
    ctx.translate(canvas.width/2 - 400, canvas.height/2 - 304);
    
    ctx.strokeStyle = 'black';
    ctx.strokeRect(psys.emitter.left, psys.emitter.top, psys.emitter.right-psys.emitter.left, psys.emitter.bottom - psys.emitter.top);

    psys.draw(ctx);
    psys.update();
}

update();
setInterval(update, 10);
updateShape();
updateUI(true);
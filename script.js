psys = new ParticleSystem();

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

bgColor = 'hsl(0, 0%, 75%)';

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

$ ('#life-min')[0].value = psys.lifeMin;
$ ('#life-max')[0].value = psys.lifeMax;
$ ('#alpha1')[0].value = psys.alpha[0];
$ ('#alpha2')[0].value = psys.alpha[1];
$ ('#alpha3')[0].value = psys.alpha[2];

function setColors(n) {
    psys.colors = n;
    $ ('.colors .option.active')[0].classList.remove('active');
    $ (`[name="${n} colors"]`)[0].classList.add('active');
}

function setAlphas(n) {
    psys.alphas = n;
    $ ('.alphas .option.active')[0].classList.remove('active');
    $ (`[name="${n} alphas"]`)[0].classList.add('active');
}

function update() {
    updateUI();

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    draw();
}

function updateUI() {
    $ ("#bg-color-display")[0].style["background-color"] = bgColor;
    $ ("#color1-display")[0].style["background-color"] = psys.color[0];
    $ ("#color2-display")[0].style["background-color"] = psys.color[1];
    $ ("#color3-display")[0].style["background-color"] = psys.color[2];
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
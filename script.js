const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

bgColor = 'hsl(0, 0%, 75%)';

const bgPickerButton = $ ('#bg-color-picker')[0];
const bgPicker = new ColorPicker(bgPickerButton, bgColor);
bgPickerButton.addEventListener('colorChange', function(event) {
    bgColor = event.detail.color.hsl;
})

psys = new ParticleSystem();

function setColor(cvar, color) {
    window[cvar] = color;
}

function update() {
    updateUI();

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    draw();
}

function updateUI() {
    $ ("#bg-color-display")[0].style["background-color"] = bgColor;
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
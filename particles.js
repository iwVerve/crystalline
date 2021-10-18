particleShape = [];
particleShape[0] = new Image(64, 64);
particleShape[0].src = "img/particles/1.png"
for (var i = 0; i <= 14; i++) {
    particleShape[i] = new Image(64, 64);
    particleShape[i].src = `img/particles/${i}.png`;
    particleShape[i]
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function rad2deg(rad) {
    return rad * (180 / Math.PI);
}

function dcos(deg) {
    return Math.cos(deg2rad(deg));
}

function dsin(deg) {
    return Math.sin(deg2rad(deg));
}

function datan(val) {
    return rad2deg(Math.atan(val));
}

function lerp (a, b, amount) {
    return (1 - amount) * a + amount * b;
}

class Color {
    constructor() {
        if (arguments.length == 0) {
            this.r = 255;
            this.g = 255;
            this.b = 255;
        }
        else if (arguments.length == 1) {
            var rgb = arguments[0].replace(/[^\d,]/g, '').split(',');
            this.r = rgb[0];
            this.g = rgb[1];
            this.b = rgb[2];           
        }
        else if (arguments.length == 3) {
            this.r = arguments[0];
            this.g = arguments[1];
            this.b = arguments[2];
        }
    }

    static lerp(c1, c2, val) {
        return new Color(lerp(c1.r, c2.r, val), lerp(c1.g, c2.g, val), lerp(c1.b, c2.b, val));
    }

    static random() {
        return new Color(255 * Math.random(), 255 * Math.random(), 255 * Math.random());
    }

    toString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
}

class ParticleSystem {
    constructor() {
        this.fps = 50;
        this.lastFrame = Date.now() - 1000/this.fps;

        this.partSize = 64;
        this.tCanvas = document.createElement('canvas');
        this.tCanvas.width = this.partSize;
        this.tCanvas.height = this.partSize;
        this.tCtx = this.tCanvas.getContext('2d');

        this.emitter = {
            left: 0,
            top: 0,
            right: 800,
            bottom: 608
        };

        this.count = 1;
        this.lifeMin = 40;
        this.lifeMax = 50;
        this.shape = 2;

        this.size = new ParticleSetting(1, 1, 0, 0);
        this.speed = new ParticleSetting(0, 0, 0, 0);
        this.direction = new ParticleSetting(0, 0, 0, 0);
        this.orientation = new ParticleSetting(0, 0, 0, 0);

        this.gravity = 0;
        this.gravityDirection = 270;

        this.alphas = 3;
        this.alpha = [0, 1, 0];
        this.additive = false;

        this.colors = 1;
        this.color = [new Color(255, 0, 0), new Color(0, 255, 0), new Color(0, 0, 255)];

        this.particles = [];
    }

    randomize() {
        this.lifeMin = 50 * Math.random();
        this.lifeMax = (3 * Math.random() + 1) * this.lifeMin;
        this.shape = 1 + Math.floor(14 * Math.random());
        var r = Math.random()/2;
        this.size = new ParticleSetting(r, (1 + Math.random()) * r, (Math.random()-0.5)/100, 0);
        r = Math.random()/2;
        this.speed = new ParticleSetting(r, (1 + Math.random()) * r, (Math.random()-0.5)/100, 0);
        r = 360 * Math.random();
        this.direction = new ParticleSetting(r, r + 360 * Math.random(), (Math.random()-0.5)*4, 0);
        r = 360 * Math.random();
        this.orientation = new ParticleSetting(r, r + 360 * Math.random(), (Math.random()-0.5)*4, 0);
        this.alphas = Math.floor(3 * Math.random()) + 1;
        for(var i = 0; i < 3; i++) {
            psys.alpha[i] = Math.random();
        }
        this.colors = Math.floor(3 * Math.random()) + 1;
        for(var i = 0; i < 3; i++) {
            psys.color[i] = Color.random();
        }
        this.additive = (Math.random()>0.5);
    }
    

    update() {
        while (Date.now() - this.lastFrame > 1000/this.fps) {
            for (const part of this.particles) {
                if (part.update()) {
                    this.particles.splice(this.particles.indexOf(part), 1);
                }
            }
    
            if (this.count >= 0) {
                for(var i = 0; i < this.count; i++) {
                    this.particles.push(new Particle(psys));
                }
            }
            else if (Math.random() < 1/(-this.count)) {
                this.particles.push(new Particle(psys));
            }

            if (Date.now() - this.lastFrame < 10000) {
                this.lastFrame += 1000/this.fps;
            }
            else {
                this.lastFrame = Date.now();
            }
        }
    }

    draw(ctx) {
        for (const part of this.particles) {
            part.draw(ctx);
        }
    }
}

class ParticleSetting {
    constructor(min, max, incr, wiggle) {
        this.min = min;
        this.max = max;
        this.incr = incr;
        this.wiggle = wiggle;
    }
}

class ParticleValue {
    constructor(pset) {
        this.incr = pset.incr;
        this.wiggle = pset.wiggle;
        this.wiggleTimer = Math.floor(16 * Math.random());

        this.value = pset.min + Math.random() * (pset.max - pset.min);
        this.value += (Math.min(this.wiggleTimer, 16-this.wiggleTimer)-4) * this.wiggle / 4;
    }

    update() {
        this.value += this.incr;
        this.value += (this.wiggleTimer % 16 < 8) ? this.wiggle / 4 : -this.wiggle / 4;
        this.wiggleTimer++;
    }
}

class Particle {
    constructor(psys) {
        this.psys = psys;

        this.time = 0;
        this.life = psys.lifeMin + Math.random() * (psys.lifeMax - psys.lifeMin);
        this.x = psys.emitter.left + Math.random() * (psys.emitter.right - psys.emitter.left);
        this.y = psys.emitter.top + Math.random() * (psys.emitter.bottom - psys.emitter.top);

        this.size = new ParticleValue(psys.size);
        this.speed = new ParticleValue(psys.speed);
        this.direction = new ParticleValue(psys.direction);
        this.orientation = new ParticleValue(psys.orientation);

        this.drawColor = new Color();
    }

    update() {
        this.time++;
        if (this.time > this.life) {
            return true;
        }
        this.size.update();
        this.speed.update();
        this.direction.update();
        this.orientation.update();

        //Move and add gravity
        var h = this.speed.value * dcos(this.direction.value);
        var v = -(this.speed.value * dsin(this.direction.value));
        h += psys.gravity * dcos(psys.gravityDirection);
        v -= psys.gravity * dsin(psys.gravityDirection);
        this.x += h;
        this.y += v;
        this.speed.value = Math.sqrt(h*h + v*v);
        this.direction.value = -rad2deg(Math.atan2(v, h));
        
        return false;
    }

    draw(ctx) {
        var size = this.size.value * psys.partSize;

        //Set draw color
        if (this.psys.colors == 1) this.drawColor = this.psys.color[0];
        else if (this.psys.colors == 2) this.drawColor = Color.lerp(this.psys.color[0], this.psys.color[1], this.time/this.life);
        else if (this.psys.colors == 3) {
            var f = this.time/this.life;
            if (f <= 0.5) this.drawColor = Color.lerp(this.psys.color[0], this.psys.color[1], 2*f);
            else this.drawColor = Color.lerp(this.psys.color[1], this.psys.color[2], 2*f-1);
        }
        
        //Draw colored particle on temporary canvas
        this.psys.tCtx.fillStyle = this.drawColor.toString();
        this.psys.tCtx.fillRect(0, 0, this.psys.tCanvas.width, this.psys.tCanvas.height);
        this.psys.tCtx.globalCompositeOperation = 'destination-in';
        this.psys.tCtx.drawImage(particleShape[psys.shape], 0, 0);
        this.psys.tCtx.globalCompositeOperation = 'source-over';

        //Set blend mode and alpha
        ctx.globalCompositeOperation = (this.psys.additive) ? 'lighter' : 'source-over';
        if (this.psys.alphas == 1) ctx.globalAlpha = this.psys.alpha[0];
        else if (this.psys.alphas == 2) ctx.globalAlpha = lerp(this.psys.alpha[0], this.psys.alpha[1], this.time/this.life);
        else if (this.psys.alphas == 3) {
            var f = this.time/this.life;
            if (f <= 0.5) ctx.globalAlpha = lerp(this.psys.alpha[0], this.psys.alpha[1], 2*f);
            else ctx.globalAlpha = lerp(this.psys.alpha[1], this.psys.alpha[2], 2*f-1);
        }

        ctx.translate(this.x, this.y);
        ctx.rotate(deg2rad(this.orientation.value));

        ctx.drawImage(this.psys.tCanvas, -size/2, -size/2, size, size);

        ctx.rotate(deg2rad(-this.orientation.value));
        ctx.translate(-this.x, -this.y);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }
}
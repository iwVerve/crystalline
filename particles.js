partSize = 64;

particleShape = [];
particleShape[0] = new Image(64, 64);
particleShape[0].src = "img/particles/1.png"
for (var i = 0; i <= 14; i++) {
    particleShape[i] = new Image(64, 64);
    particleShape[i].src = `img/particles/${i}.png`;
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

class ParticleSystem {
    constructor() {
        this.fps = 50;
        this.lastFrame = Date.now() - 1000/this.fps;

        this.emitter = {
            left: 0,
            top: 0,
            right: 800,
            bottom: 608
        };

        this.count = 25;
        this.lifeMin = 40;
        this.lifeMax = 50;
        this.shape = 4;

        this.size = new ParticleSetting(0.3, 0.5, -0.01, 0);
        this.speed = new ParticleSetting(0, 0, 0, 0);
        this.direction = new ParticleSetting(0, 0, 0, 0);
        this.orientation = new ParticleSetting(90, 90, 0, 0);

        this.gravity = 0.6;
        this.gravityDirection = 270;

        this.alphas = 3;
        this.alpha = [0, 1, 0];
        this.additive = false;

        this.particles = [];
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
            this.lastFrame += 1000/this.fps;
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
        this.time = 0;
        this.life = psys.lifeMin + Math.random() * (psys.lifeMax - psys.lifeMin);
        this.x = psys.emitter.left + Math.random() * (psys.emitter.right - psys.emitter.left);
        this.y = psys.emitter.top + Math.random() * (psys.emitter.bottom - psys.emitter.top);
        this.shape = psys.shape;

        this.size = new ParticleValue(psys.size);
        this.speed = new ParticleValue(psys.speed);
        this.direction = new ParticleValue(psys.direction);
        this.orientation = new ParticleValue(psys.orientation);

        this.gravity = psys.gravity;
        this.gravityDirection = psys.gravityDirection;

        this.alphas = psys.alphas;
        this.alpha = psys.alpha;
        this.additive = psys.additive;
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

        var h = this.speed.value * dcos(this.direction.value);
        var v = -(this.speed.value * dsin(this.direction.value));
        h += this.gravity * dcos(this.gravityDirection);
        v -= this.gravity * dsin(this.gravityDirection);
        this.x += h;
        this.y += v;
        this.speed.value = Math.sqrt(h*h + v*v);
        this.direction.value = -rad2deg(Math.atan2(v, h));
        
        return false;
    }

    draw(ctx) {
        var size = this.size.value * partSize;

        ctx.globalCompositeOperation = (this.additive) ? 'lighter' : 'source-over';
        if (this.alphas == 1) ctx.globalAlpha = this.alpha[0];
        else if (this.alphas == 2) ctx.globalAlpha = lerp(this.alpha[0], this.alpha[1], this.time/this.life);
        else if (this.alphas == 3) {
            var f = this.time/this.life;
            if (f <= 0.5) ctx.globalAlpha = lerp(this.alpha[0], this.alpha[1], 2*f);
            else ctx.globalAlpha = lerp(this.alpha[1], this.alpha[2], 2*f-1);
        }
        ctx.translate(this.x, this.y);
        ctx.rotate(deg2rad(this.orientation.value));

        ctx.drawImage(particleShape[this.shape], -size/2, -size/2, size, size);

        ctx.rotate(deg2rad(-this.orientation.value));
        ctx.translate(-this.x, -this.y);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'lighter';
    }
}
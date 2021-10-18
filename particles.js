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

function lerp(a, b, amount) {
    return (1 - amount) * a + amount * b;
}

function toFixed(num, fixed, string) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    var n = num.toString().match(re)[0];
    if (arguments.length == 3) return n;
    else return Number(n);
}

function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8,"+encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
            this.r = Number(rgb[0]);
            this.g = Number(rgb[1]);
            this.b = Number(rgb[2]); 
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
        return new Color(toFixed(255 * Math.random(), 0), toFixed(255 * Math.random(), 0), toFixed(255 * Math.random(), 0));
    }

    toString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    toGml() {
        return Math.floor(this.r + 256 * (this.g + 256 * this.b));
    }
}

class ParticleSystem {
    constructor() {
        this.psysName = "global.psys";
        this.ptypName = "global.ptyp";
        this.depth = -100;

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

        this.burstCount = 10;

        this.particles = [];
    }

    clear() {
        this.particles = [];
    }

    randomize() {
        this.lifeMin = toFixed(50 * Math.random(), 0);
        this.lifeMax = toFixed((3 * Math.random() + 1) * this.lifeMin, 0);
        this.shape = 1 + Math.floor(14 * Math.random());
        var r = Math.random()/2;
        this.size = new ParticleSetting(toFixed(r, 2), toFixed((1 + Math.random()) * r + Math.random()/2, 2), toFixed((Math.random()-0.5)/100, 3), 0);
        r = Math.random()/2;
        this.speed = new ParticleSetting(toFixed(r, 2), toFixed((1 + Math.random()) * r, 2), toFixed((Math.random()-0.5)/100, 3), 0);
        r = 360 * Math.random();
        this.direction = new ParticleSetting(toFixed(r, 2), toFixed(r + 360 * Math.random(), 2), toFixed((Math.random()-0.5)*4, 2), 0);
        r = 360 * Math.random();
        this.orientation = new ParticleSetting(toFixed(r, 2), toFixed(r + 360 * Math.random(), 2), toFixed((Math.random()-0.5)*4, 2), 0);
        this.alphas = Math.floor(3 * Math.random()) + 1;
        for(var i = 0; i < 3; i++) {
            psys.alpha[i] = toFixed(Math.random(), 2);
        }
        this.colors = Math.floor(3 * Math.random()) + 1;
        for(var i = 0; i < 3; i++) {
            psys.color[i] = Color.random();
        }
        this.additive = (Math.random()>0.5);

        this.clear();
    }

    burst(x, y) {
        for (var i = 0; i < this.burstCount; i++) {
            var p = new Particle(this);
            p.x = x;
            p.y = y;
            this.particles.push(p);
        }
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

    export() {
        return `// Particle code generated by CrystallineJS\n` +
        `// https://iwverve.github.io/crystalline/\n` +
        `\n` +
        `\n` +
        `// -------- Particle System --------\n` +
        `// Run this code at the beginning of your game\n` +
        `${this.psysName} = part_system_create();\n` +
        `part_system_depth(${this.psysName}, ${this.depth});\n` +
        `\n` +
        `\n` +
        `// -------- Particle Type --------\n` +
        `// Run this code at the beginning of your game\n` +
        `${this.ptypName} = part_type_create();\n` +
        `part_type_shape(${this.ptypName}, ${this.getShapeConst(this.shape)});\n` +
        `${this.exportColor()}\n` +
        `${this.exportAlpha()}\n` +
        `part_type_life(${this.ptypName}, ${this.lifeMin}, ${this.lifeMax});\n` +
        `part_type_size(${this.ptypName}, ${this.size.min}, ${this.size.max}, ${this.size.incr}, ${this.size.wiggle});\n` +
        `part_type_speed(${this.ptypName}, ${this.speed.min}, ${this.speed.max}, ${this.speed.incr}, ${this.speed.wiggle});\n` +
        `part_type_direction(${this.ptypName}, ${this.direction.min}, ${this.direction.max}, ${this.direction.incr}, ${this.direction.wiggle});\n` +
        `part_type_orientation(${this.ptypName}, ${this.orientation.min}, ${this.orientation.max}, ${this.orientation.incr}, ${this.orientation.wiggle}, false);\n` +
        `part_type_gravity(${this.ptypName}, ${this.gravity}, ${this.gravityDirection});\n` +
        `part_type_blend(${this.ptypName}, ${(this.additive) ? 'true' : 'false'});\n` +
        `\n` +
        `\n` +
        `// -------- Particle Emitter --------\n` +
        `// Consistently creates particles\n` +
        `// Run this in the Create event of the object emitting the particles\n` +
        `pemi = part_emitter_create(${this.psysName});\n` +
        `part_emitter_region(${this.psysName}, pemi, ${this.emitter.left}, ${this.emitter.right}, ${this.emitter.top}, ${this.emitter.bottom}, ps_shape_rectangle, ps_distr_linear);\n` +
        `part_emitter_stream(${this.psysName}, pemi, ${this.ptypName}, ${this.count});\n` +
        `\n` +
        `// Run this in the Destroy event of the object emitting the particles\n` +
        `part_emitter_destroy(${this.psysName}, pemi);\n` +
        `\n` +
        `// Run this in the Room End event of the object emitting the particles\n` +
        `instance_destroy();\n` +
        `part_particles_clear(${this.psysName});\n` +
        `\n` +
        `\n` +
        `// -------- Particle Burst --------\n` +
        `// Creates particles once at a specific position, instead of constantly emitting them\n` +
        `// Run this whenever you want to burst the particles\n` +
        `part_particles_create(${this.psysName}, x, y, ${this.ptypName}, ${this.burstCount});`
    }

    exportColor() {
        switch(this.colors) {
            case 1: return `part_type_color1(${this.ptypName}, ${this.color[0].toGml()});`; break;
            case 2: return `part_type_color2(${this.ptypName}, ${this.color[0].toGml()}, ${this.color[1].toGml()});`; break;
            case 3: return `part_type_color3(${this.ptypName}, ${this.color[0].toGml()}, ${this.color[1].toGml()}, ${this.color[2].toGml()});`; break;
        }
    }

    exportAlpha() {
        switch(this.alphas) {
            case 1: return `part_type_alpha1(${this.ptypName}, ${this.alpha[0]});`; break;
            case 2: return `part_type_alpha2(${this.ptypName}, ${this.alpha[0]}, ${this.alpha[1]});`; break;
            case 3: return `part_type_alpha3(${this.ptypName}, ${this.alpha[0]}, ${this.alpha[1]}, ${this.alpha[2]});`; break;
        }
    }

    getShapeConst(shapeId) {
        switch(shapeId) {
            case 1: return 'pt_shape_pixel'; break;
            case 2: return 'pt_shape_disk'; break;
            case 3: return 'pt_shape_square'; break;
            case 4: return 'pt_shape_line'; break;
            case 5: return 'pt_shape_star'; break;
            case 6: return 'pt_shape_circle'; break;
            case 7: return 'pt_shape_ring'; break;
            case 8: return 'pt_shape_sphere'; break;
            case 9: return 'pt_shape_flare'; break;
            case 10: return 'pt_shape_spark'; break;
            case 11: return 'pt_shape_explosion'; break;
            case 12: return 'pt_shape_cloud'; break;
            case 13: return 'pt_shape_smoke'; break;
            case 14: return 'pt_shape_snow'; break;
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
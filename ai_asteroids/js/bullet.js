class BulletParticle {
    constructor(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.life = 0.5; // Half second lifetime
        this.size = random(1, 2);
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime;
        this.vx *= 0.95; // Add drag
        this.vy *= 0.95;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.min(1, this.life * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Bullet extends Entity {
    constructor(x, y, direction, size) {
        super(x, y, size, HERO_COLOR);
        this.velocity.x = Math.cos(direction) * BULLET_SPEED;
        this.velocity.y = Math.sin(direction) * BULLET_SPEED;
        this.spawnTime = performance.now();
        this.particles = [];
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        // Update lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.active = false;
        }

        // Call parent update with canvas dimensions
        super.update(deltaTime, canvasWidth, canvasHeight);

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });

        // Check if bullet should expire
        if (performance.now() - this.spawnTime >= BULLET_LIFESPAN) {
            this.destroy();
        }

        // Check if bullet hits screen edge
        if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
            this.createParticleBurst();
            this.destroy();
            return;
        }
    }

    createParticleBurst() {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = random(50, 150);
            this.particles.push(new BulletParticle(this.x, this.y, angle, speed, this.color));
        }
    }

    draw(ctx) {
        // Draw particles
        for (const particle of this.particles) {
            particle.draw(ctx);
        }

        // Draw bullet
        if (this.active) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
} 
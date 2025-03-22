class TrailParticle {
    constructor(x, y, rotation) {
        this.x = x;
        this.y = y;
        this.life = 1; // 1 second lifetime
        this.size = random(1, 2); // 50% smaller (was 2-4)
        this.baseColor = { r: 255, g: 255, b: 0 }; // Yellow
        this.targetColor = { r: 255, g: 255, b: 255 }; // White
        
        // Add velocity for flaring effect
        const spread = random(-0.8, 0.8); // Increased spread angle for more variation
        const speed = random(80, 120); // Increased speed range for more dramatic effect
        this.vx = Math.cos(rotation + Math.PI + spread) * speed;
        this.vy = Math.sin(rotation + Math.PI + spread) * speed;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        // Update position based on velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        // Remove slowdown to maintain particle speed until fade out
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Calculate color transition based on life
        const transition = 1 - this.life; // 0 = yellow, 1 = white
        const r = Math.floor(this.baseColor.r + (this.targetColor.r - this.baseColor.r) * transition);
        const g = Math.floor(this.baseColor.g + (this.targetColor.g - this.baseColor.g) * transition);
        const b = Math.floor(this.baseColor.b + (this.targetColor.b - this.baseColor.b) * transition);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.globalAlpha = Math.min(1, this.life * 2); // Fade out
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Hero extends Entity {
    constructor(x, y) {
        super(x, y, 22, HERO_COLOR); // 50% bigger (was 15)
        this.currentSpeed = 0;
        this.velocity = { x: 0, y: 0 }; // Override Entity's velocity
        this.hasShield = false;
        this.weapons = [1]; // Start with weapon 1, array of active weapons
        this.currentWeapon = WEAPONS[1]; // Initialize with the first weapon
        this.lastShot = {}; // Track last shot time for each weapon
        this.trail = [];
        this.trailMaxLength = 40; // Increased for more particles
        this.trailUpdateInterval = 20; // Decreased for more frequent particles
        this.lastTrailUpdate = 0;
        this.isInvincible = false;
        this.invincibilityEndTime = 0;
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        // Update position based on current velocity
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // Update rotation
        this.rotation += this.rotationVelocity * deltaTime;
        this.rotation = normalizeAngle(this.rotation);

        // Wrap around screen edges
        if (this.x < -this.radius) this.x = canvasWidth + this.radius;
        if (this.x > canvasWidth + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvasHeight + this.radius;
        if (this.y > canvasHeight + this.radius) this.y = -this.radius;

        // Update trail
        const now = performance.now();
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (now - this.lastTrailUpdate > this.trailUpdateInterval && speed > 0 && this.currentSpeed !== 0) {
            // Add new particle slightly behind the ship
            const offset = 15; // Offset from ship center
            const particleX = this.x - Math.cos(this.rotation) * offset;
            const particleY = this.y - Math.sin(this.rotation) * offset;
            this.trail.push(new TrailParticle(particleX, particleY, this.rotation));
            this.lastTrailUpdate = now;
        }

        // Update and remove dead particles
        this.trail = this.trail.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });

        // Update invincibility
        if (this.isInvincible && now >= this.invincibilityEndTime) {
            this.isInvincible = false;
        }
    }

    draw(ctx) {
        // Draw trail particles
        for (const particle of this.trail) {
            particle.draw(ctx);
        }

        // Draw ship with flashing effect when invincible
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Make ship flash when invincible
        if (this.isInvincible) {
            ctx.globalAlpha = Math.sin(performance.now() / 50) * 0.5 + 0.5;
        }

        // Draw triangular ship
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-10, 10);
        ctx.lineTo(-10, -10);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw shield if active
        if (this.hasShield) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
    }

    moveForward() {
        // Add velocity in the direction we're facing
        const thrust = HERO_MOVEMENT_SPEED * 0.25; // Reduced thrust for more gradual changes
        this.velocity.x += Math.cos(this.rotation) * thrust;
        this.velocity.y += Math.sin(this.rotation) * thrust;
        
        // Cap maximum velocity
        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (currentSpeed > HERO_MOVEMENT_SPEED * 1.5) {
            const scale = (HERO_MOVEMENT_SPEED * 1.5) / currentSpeed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }
        this.currentSpeed = currentSpeed;
    }

    moveBackward() {
        // Add reverse velocity
        const thrust = HERO_REVERSE_SPEED * 0.25; // Reduced thrust for more gradual changes
        this.velocity.x -= Math.cos(this.rotation) * thrust;
        this.velocity.y -= Math.sin(this.rotation) * thrust;
        
        // Cap maximum velocity
        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (currentSpeed > HERO_MOVEMENT_SPEED * 1.5) {
            const scale = (HERO_MOVEMENT_SPEED * 1.5) / currentSpeed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }
        this.currentSpeed = currentSpeed;
    }

    stopMoving() {
        // Do nothing - in space we don't stop!
        this.currentSpeed = 0;
    }

    rotateLeft() {
        this.rotationVelocity = -HERO_ROTATION_SPEED;
    }

    rotateRight() {
        this.rotationVelocity = HERO_ROTATION_SPEED;
    }

    stopRotating() {
        this.rotationVelocity = 0;
    }

    canShoot(weaponLevel) {
        const now = performance.now();
        const weapon = WEAPONS[weaponLevel];
        return now - weapon.lastFired >= weapon.fireRate;
    }

    shoot() {
        const now = performance.now();
        const bullets = [];

        // Process all active weapons
        for (const weaponLevel of this.weapons) {
            if (!this.canShoot(weaponLevel)) continue;

            const weaponConfig = WEAPONS[weaponLevel];
            weaponConfig.lastFired = now;
            const spacing = weaponConfig.spacing || 1; // Default to 1 if not specified

            switch (weaponConfig.pattern) {
                case 'single':
                    bullets.push(new Bullet(this.x, this.y, this.rotation, weaponConfig.bulletSize));
                    break;
                case 'parallel-forward':
                    const offset = 10 * spacing; // Apply spacing multiplier
                    bullets.push(
                        new Bullet(this.x + Math.cos(this.rotation + Math.PI/2) * offset, 
                                  this.y + Math.sin(this.rotation + Math.PI/2) * offset, 
                                  this.rotation, weaponConfig.bulletSize),
                        new Bullet(this.x + Math.cos(this.rotation - Math.PI/2) * offset,
                                  this.y + Math.sin(this.rotation - Math.PI/2) * offset,
                                  this.rotation, weaponConfig.bulletSize)
                    );
                    break;
                case 'side':
                    bullets.push(
                        new Bullet(this.x, this.y, this.rotation + Math.PI/2, weaponConfig.bulletSize),
                        new Bullet(this.x, this.y, this.rotation - Math.PI/2, weaponConfig.bulletSize)
                    );
                    break;
                case 'parallel-backward':
                    bullets.push(
                        new Bullet(this.x + Math.cos(this.rotation + Math.PI/2) * 10,
                                  this.y + Math.sin(this.rotation + Math.PI/2) * 10,
                                  this.rotation + Math.PI, weaponConfig.bulletSize),
                        new Bullet(this.x + Math.cos(this.rotation - Math.PI/2) * 10,
                                  this.y + Math.sin(this.rotation - Math.PI/2) * 10,
                                  this.rotation + Math.PI, weaponConfig.bulletSize)
                    );
                    break;
                case 'radial':
                    const angleStep = (Math.PI * 2) / weaponConfig.bulletCount;
                    for (let i = 0; i < weaponConfig.bulletCount; i++) {
                        bullets.push(new Bullet(this.x, this.y, 
                                             this.rotation + i * angleStep,
                                             weaponConfig.bulletSize));
                    }
                    break;
            }
        }

        return bullets;
    }

    upgradeWeapon(weaponLevel) {
        if (!this.weapons.includes(weaponLevel)) {
            this.weapons.push(weaponLevel);
        }
    }

    addShield() {
        this.hasShield = true;
    }

    removeShield() {
        this.hasShield = false;
    }

    makeInvincible(duration) {
        this.isInvincible = true;
        this.invincibilityEndTime = performance.now() + duration;
    }
} 
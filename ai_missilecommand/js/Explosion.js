class Explosion {
    constructor(x, y, color = CONSTANTS.COLORS.EXPLOSION) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.timer = 0;
        this.radius = CONSTANTS.EXPLOSION.MIN_RADIUS;
        this.maxRadius = CONSTANTS.EXPLOSION.MAX_RADIUS;
        this.expanding = true;
        this.timeElapsed = 0;
        this.destroyedAsteroids = 0;
        this.points = 0;
        this.multiplier = 1;
        this.hitAsteroids = new Set(); // Track which asteroids we've already hit
    }

    update(deltaTime) {
        this.timer += deltaTime * 1000;
        
        if (this.timer <= CONSTANTS.EXPLOSION.EXPAND_TIME) {
            // Expand phase
            const progress = this.timer / CONSTANTS.EXPLOSION.EXPAND_TIME;
            this.radius = CONSTANTS.EXPLOSION.MIN_RADIUS + 
                (CONSTANTS.EXPLOSION.MAX_RADIUS - CONSTANTS.EXPLOSION.MIN_RADIUS) * progress;
        } else {
            // Shrink phase
            const progress = (this.timer - CONSTANTS.EXPLOSION.EXPAND_TIME) / 
                (CONSTANTS.EXPLOSION.DURATION - CONSTANTS.EXPLOSION.EXPAND_TIME);
            this.radius = CONSTANTS.EXPLOSION.MAX_RADIUS * (1 - progress);
        }
        
        return this.timer >= CONSTANTS.EXPLOSION.DURATION;
    }

    render(ctx) {
        // Create radial gradient using the explosion's color
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        // Add gradient stops with varying opacity
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.4, this.color);
        gradient.addColorStop(1, 'transparent');

        // Draw filled explosion with gradient
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw outline with glow effect
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    checkCollision(asteroid) {
        // Skip if we've already hit this asteroid or if it's already destroyed
        if (this.hitAsteroids.has(asteroid) || asteroid.destroyed) return false;
        
        const dx = this.x - asteroid.x;
        const dy = this.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if asteroid is within explosion radius
        if (distance <= this.radius + asteroid.radius) {
            this.hitAsteroids.add(asteroid); // Remember this asteroid
            this.destroyedAsteroids++;
            return true;
        }
        return false;
    }

    getPoints() {
        // Calculate points based on number of asteroids destroyed
        if (this.destroyedAsteroids === 0) return 0;
        
        let points = 0;
        for (let i = 0; i < this.destroyedAsteroids; i++) {
            points += CONSTANTS.SCORING.BASE_POINTS * (i + 1);
        }
        return points;
    }

    getMultiplier() {
        return this.destroyedAsteroids;
    }
} 
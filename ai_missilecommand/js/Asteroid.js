class Asteroid {
    constructor(x, speed, launchers, bases) {
        this.x = x;
        this.y = 0;
        this.radius = CONSTANTS.ASTEROID.SIZE;
        this.speed = speed;
        
        // Add rotation properties
        this.rotation = Math.random() * Math.PI * 2; // Random initial rotation
        this.rotationSpeed = (Math.random() * 0.5 + 0.5) * Math.PI; // 0.5 to 1.0 PI radians per second
        
        // Generate wonky shape points
        this.points = [];
        const numPoints = 8;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const variance = 0.3; // How wonky the shape is (0 = perfect circle, 1 = very wonky)
            const radiusOffset = 1 + (Math.random() * 2 - 1) * variance;
            this.points.push({
                x: Math.cos(angle) * this.radius * radiusOffset,
                y: Math.sin(angle) * this.radius * radiusOffset
            });
        }
        
        // Choose target from active launchers and bases
        const targets = [];
        
        // Add active launchers as potential targets
        launchers.forEach(launcher => {
            if (!launcher.destroyed) {
                targets.push({
                    x: launcher.x,
                    y: launcher.y,
                    weight: 2  // Higher weight for launchers
                });
            }
        });
        
        // Add active bases as potential targets
        bases.forEach(base => {
            if (base.currentHp > 0) {
                // Add random variance along the base width
                const randomOffset = (Math.random() - 0.5) * base.width;
                targets.push({
                    x: base.x + base.width/2 + randomOffset,
                    y: base.y,
                    weight: 1  // Lower weight for bases
                });
            }
        });

        // If no active targets, choose random point
        if (targets.length === 0) {
            this.targetX = Math.random() * CONSTANTS.MAX_GAME_WIDTH;
            this.targetY = CONSTANTS.GROUND_LEVEL;
        } else {
            // Choose random target weighted by type
            const totalWeight = targets.reduce((sum, t) => sum + t.weight, 0);
            let random = Math.random() * totalWeight;
            
            let chosen = targets[targets.length - 1];
            for (const target of targets) {
                if (random <= target.weight) {
                    chosen = target;
                    break;
                }
                random -= target.weight;
            }
            
            this.targetX = chosen.x;
            this.targetY = chosen.y;
        }

        // Calculate direction
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;

        // Trail effect
        this.trail = [];
        this.trailTimer = 0;
        this.destroyed = false;
        
        // Explosion effect
        this.explosionParticles = [];
    }

    update(deltaTime) {
        if (this.destroyed) {
            // Update explosion particles
            for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
                const particle = this.explosionParticles[i];
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.alpha -= deltaTime * 1.5;
                particle.size *= 1.02; // Slowly increase size
                
                if (particle.alpha <= 0) {
                    this.explosionParticles.splice(i, 1);
                }
            }
            
            // Return true only when explosion is complete
            return this.explosionParticles.length === 0;
        }

        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;

        // Update trail
        this.trailTimer += deltaTime;
        if (this.trailTimer >= 0.03) {
            // Calculate the back direction of the asteroid
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const backDirectionX = -this.vx / speed;
            const backDirectionY = -this.vy / speed;
            
            // Add particles for each trail point
            for (let i = 0; i < 4; i++) {
                // Get a random point from the asteroid's edge
                const randomPointIndex = Math.floor(Math.random() * this.points.length);
                const point = this.points[randomPointIndex];
                
                // Calculate the actual position of the point considering rotation
                const cos = Math.cos(this.rotation);
                const sin = Math.sin(this.rotation);
                const rotatedX = point.x * cos - point.y * sin;
                const rotatedY = point.x * sin + point.y * cos;
                
                // Check if this point is in the back half of the asteroid
                const dotProduct = (rotatedX * backDirectionX + rotatedY * backDirectionY);
                if (dotProduct < 0) { // Only spawn particles from back half
                    // Add a small random spread from the point
                    const spread = this.radius * 0.2;
                    const randomOffset = {
                        x: (Math.random() - 0.5) * spread + backDirectionX * this.radius * 0.2,
                        y: (Math.random() - 0.5) * spread + backDirectionY * this.radius * 0.2
                    };

                    this.trail.push({
                        x: this.x + rotatedX + randomOffset.x,
                        y: this.y + rotatedY + randomOffset.y,
                        alpha: 1,
                        size: Math.random() * this.radius * 0.2 + this.radius * 0.1
                    });
                }
            }
            this.trailTimer = 0;
        }

        // Update trail points
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].alpha -= deltaTime * 1.2;
            if (this.trail[i].alpha <= 0) {
                this.trail.splice(i, 1);
            }
        }

        // Return true if asteroid is out of bounds or destroyed
        return this.destroyed ||
               this.y > CONSTANTS.CANVAS_HEIGHT || 
               this.x < -this.radius * 1.5 || 
               this.x > CONSTANTS.MAX_GAME_WIDTH + this.radius * 1.5;
    }

    render(ctx) {
        if (this.destroyed) {
            // Draw explosion particles
            for (const particle of this.explosionParticles) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 136, ${particle.alpha * 0.5})`;
                ctx.fill();
                
                // Add glow effect to particles
                ctx.shadowBlur = 10;
                ctx.shadowColor = CONSTANTS.COLORS.DANGER;
                ctx.strokeStyle = CONSTANTS.COLORS.DANGER;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            return;
        }

        // Draw trail particles
        for (const particle of this.trail) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 0, 136, ${particle.alpha * 0.3})`;
            ctx.fill();
        }

        // Draw asteroid
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (const point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        
        // Add semi-transparent fill
        ctx.fillStyle = `rgba(255, 0, 136, 0.25)`;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = CONSTANTS.COLORS.DANGER;
        ctx.strokeStyle = CONSTANTS.COLORS.DANGER;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.restore();

        // Draw target indicator line
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.targetX, this.targetY);
        ctx.strokeStyle = `rgba(255, 0, 136, 0.2)`;
        ctx.stroke();
    }

    checkCollision(obj) {
        if (this.destroyed) return false;
        
        if (obj instanceof Launcher) {
            return obj.checkCollision(this);
        } else {
            // Base collision - using average radius for simplicity
            const bounds = obj.getBounds();
            const closestX = Math.max(bounds.x, Math.min(this.x, bounds.x + bounds.width));
            const closestY = Math.max(bounds.y, Math.min(this.y, bounds.y + bounds.height));

            const distanceX = this.x - closestX;
            const distanceY = this.y - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            return distanceSquared < (this.radius * this.radius * 1.2); // Slightly larger collision radius to account for wonky shape
        }
    }

    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            
            // Create explosion particles
            const numParticles = 20;
            for (let i = 0; i < numParticles; i++) {
                const angle = (i / numParticles) * Math.PI * 2;
                const speed = Math.random() * 200 + 100; // Random speed between 100 and 300
                const variance = Math.random() * Math.PI / 4; // Random angle variance
                
                this.explosionParticles.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle + variance) * speed,
                    vy: Math.sin(angle + variance) * speed,
                    size: Math.random() * this.radius * 0.4 + this.radius * 0.2,
                    alpha: 1
                });
            }
        }
    }
} 
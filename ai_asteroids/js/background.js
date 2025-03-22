class ShootingStar {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        this.trail = [];
        this.lastTrailUpdate = 0;
        this.trailUpdateInterval = 20;
    }

    reset() {
        // Start from outside the canvas (left or top edge)
        const startFromTop = Math.random() > 0.5;
        if (startFromTop) {
            this.x = random(0, this.canvas.width);
            this.y = -10;
        } else {
            this.x = -10;
            this.y = random(0, this.canvas.height * 0.7); // Start in top 70% of screen
        }

        // Angle between 30 and 60 degrees
        const angle = startFromTop ? 
            random(Math.PI / 6, Math.PI / 3) : // For top starts
            random(-Math.PI / 6, Math.PI / 3);  // For left starts
        
        const speed = random(400, 600);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.active = true;
    }

    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Update trail
        const now = performance.now();
        if (now - this.lastTrailUpdate > this.trailUpdateInterval) {
            // Calculate trail angle based on movement direction
            const trailAngle = Math.atan2(this.vy, this.vx);
            
            // Add new trail particle
            const spread = random(-0.8, 0.8); // Match ship trail spread
            const speed = random(80, 120); // Match ship trail speed
            
            this.trail.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(trailAngle + Math.PI + spread) * speed,
                vy: Math.sin(trailAngle + Math.PI + spread) * speed,
                life: 1,
                size: random(1, 2), // Half the original size (was 2-4)
                baseColor: { r: 255, g: 255, b: 255 }, // White
                targetColor: { r: 200, g: 200, b: 255 } // Light blue
            });
            
            this.lastTrailUpdate = now;
        }

        // Update and remove dead trail particles
        this.trail = this.trail.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            return particle.life > 0;
        });

        // Check if star is off screen
        const starOffScreen = this.x > this.canvas.width + 50 || 
                            this.y > this.canvas.height + 50 || 
                            this.x < -50 || 
                            this.y < -50;

        if (starOffScreen && this.trail.length === 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        // Draw trail particles
        this.trail.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            
            // Calculate color transition based on life
            const transition = 1 - particle.life;
            const r = Math.floor(particle.baseColor.r + (particle.targetColor.r - particle.baseColor.r) * transition);
            const g = Math.floor(particle.baseColor.g + (particle.targetColor.g - particle.baseColor.g) * transition);
            const b = Math.floor(particle.baseColor.b + (particle.targetColor.b - particle.baseColor.b) * transition);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.globalAlpha = Math.min(0.25, particle.life); // Changed to 0.25 opacity
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        // Draw the shooting star itself
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; // Changed to 0.25 opacity
        ctx.fill();
    }
}

class BackgroundStar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(1, 2.5); // Slightly larger to create softer appearance
        this.brightness = random(0.2, 0.7);
        this.twinkleSpeed = random(0.5, 2);
        this.twinkleOffset = random(0, Math.PI * 2);
        this.canvas = null; // Will be set by Background class
    }

    update(deltaTime) {
        // Update twinkle effect
        this.twinkleOffset += this.twinkleSpeed * deltaTime;
        const newBrightness = 0.2 + (Math.sin(this.twinkleOffset) + 1) * 0.25;
        
        // If star is fading out (crossing below threshold), change position
        if (newBrightness < 0.3 && this.brightness >= 0.3 && this.canvas) {
            this.x = random(0, this.canvas.width);
            this.y = random(0, this.canvas.height);
        }
        
        this.brightness = newBrightness;
    }

    draw(ctx) {
        // Draw a larger, fainter circle first
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness * 0.3})`;
        ctx.fill();

        // Draw the main star on top
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.fill();
    }
}

class BackgroundAsteroid {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.size = random(5, 25); // Reduced size range for more subtle background asteroids
        this.speed = random(15, 30); // Slightly slower for larger asteroids
        const angle = random(0, Math.PI * 2);
        this.velocity = {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed
        };
        this.rotation = random(0, Math.PI * 2);
        this.rotationSpeed = random(-0.3, 0.3); // Slower rotation for more stable appearance
        this.points = this.generatePoints();
    }

    generatePoints() {
        const points = [];
        const numPoints = Math.floor(random(8, 12));
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = this.size * (0.8 + Math.random() * 0.4); // Vary radius by ±20%
            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        return points;
    }

    update(deltaTime) {
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;

        // Wrap around screen edges
        if (this.x < -this.size) this.x = this.canvasWidth + this.size;
        if (this.x > this.canvasWidth + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = this.canvasHeight + this.size;
        if (this.y > this.canvasHeight + this.size) this.y = -this.size;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw a larger, very faint outline first
        ctx.beginPath();
        ctx.moveTo(this.points[0].x * 1.1, this.points[0].y * 1.1);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x * 1.1, this.points[i].y * 1.1);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 34, 34, 0.3)';
        ctx.fill();

        // Draw the main asteroid
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = '#222222';
        ctx.fill();
        ctx.strokeStyle = '#333333';
        ctx.stroke();
        
        ctx.restore();
    }

    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + other.size);
    }

    bounce(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Relative velocity
        const dvx = other.velocity.x - this.velocity.x;
        const dvy = other.velocity.y - this.velocity.y;
        
        // Impact speed
        const impactSpeed = dvx * nx + dvy * ny;
        
        // Don't resolve collision if objects are moving apart
        if (impactSpeed > 0) return;
        
        // Collision response
        const restitution = 0.5; // Reduced bounciness
        const dampening = 0.8;   // Added dampening factor
        
        // Calculate impulse
        const j = -(1 + restitution) * impactSpeed * dampening;
        
        // Adjust velocities with mass consideration (larger asteroids affected less)
        const massRatio1 = this.size / (this.size + other.size);
        const massRatio2 = other.size / (this.size + other.size);
        
        // Apply impulse with mass ratios
        this.velocity.x -= nx * j * massRatio2;
        this.velocity.y -= ny * j * massRatio2;
        other.velocity.x += nx * j * massRatio1;
        other.velocity.y += ny * j * massRatio1;
        
        // Add speed limit
        const maxSpeed = 50;
        const limitVelocity = (vel) => {
            const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
            if (speed > maxSpeed) {
                const scale = maxSpeed / speed;
                vel.x *= scale;
                vel.y *= scale;
            }
        };
        
        limitVelocity(this.velocity);
        limitVelocity(other.velocity);
        
        // Ensure minimum separation to prevent sticking
        const overlap = (this.size + other.size) - distance;
        if (overlap > 0) {
            const separationX = nx * overlap * 0.5;
            const separationY = ny * overlap * 0.5;
            this.x -= separationX;
            this.y -= separationY;
            other.x += separationX;
            other.y += separationY;
        }
    }
}

class BokehParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        // Space colors: deep blues, purples, and teals with increased saturation
        this.colors = [
            { r: 70, g: 100, b: 200 },  // Brighter blue
            { r: 120, g: 70, b: 200 },  // Brighter purple
            { r: 50, g: 170, b: 160 },  // Brighter teal
            { r: 60, g: 120, b: 255 },  // Bright blue
            { r: 130, g: 50, b: 180 }   // Bright purple
        ];
        this.color = this.colors[Math.floor(random(0, this.colors.length))];
        this.initializeAlphaCycle();
    }

    initializeAlphaCycle() {
        // Random starting point in the cycle
        this.pulseOffset = random(0, Math.PI * 2);
        // Double the cycle speed
        this.pulseSpeed = random(0.4, 0.8);
        // Base alpha and range values
        this.baseAlpha = random(0.02, 0.03);
        this.alphaRange = random(0.015, 0.02);
    }

    reset() {
        this.x = random(0, this.canvas.width);
        this.y = random(0, this.canvas.height);
        this.size = random(600, 1200);
        this.initializeAlphaCycle();
    }

    update(deltaTime) {
        // Update pulse for alpha
        this.pulseOffset += this.pulseSpeed * deltaTime;
        if (this.pulseOffset > Math.PI * 2) {
            this.pulseOffset -= Math.PI * 2;
        }

        // Calculate current alpha
        const pulseAlpha = Math.sin(this.pulseOffset) * this.alphaRange;
        const currentAlpha = this.baseAlpha + pulseAlpha;

        // If fully faded out, reset position
        if (currentAlpha <= 0.001) {
            this.x = random(0, this.canvas.width);
            this.y = random(0, this.canvas.height);
        }
    }

    draw(ctx) {
        // Save the current context state
        ctx.save();
        
        // Set blending mode for better visibility
        ctx.globalCompositeOperation = 'screen';
        
        // Calculate current alpha based on pulse
        const pulseAlpha = Math.sin(this.pulseOffset) * this.alphaRange;
        const currentAlpha = this.baseAlpha + pulseAlpha;

        // Create gradient for softer bokeh effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size / 2
        );
        
        // Brighter center, softer falloff
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentAlpha * 1.5})`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentAlpha * 0.8})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Restore the context state
        ctx.restore();
    }
}

class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.stars = [];
        this.asteroids = [];
        this.shootingStar = null;
        this.lastShootingStarTime = 0;
        this.nextShootingStarDelay = random(10000, 20000); // 10-20 seconds
        
        // Add bokeh particles
        this.bokehParticles = [];
        const numBokeh = random(7, 12); // At least 7 particles, up to 12
        for (let i = 0; i < numBokeh; i++) {
            this.bokehParticles.push(new BokehParticle(canvas));
        }

        // Create exactly 100 stars spread across the entire viewport
        const numStars = 100;
        
        // Divide the canvas into a grid to ensure even distribution
        const gridSize = Math.ceil(Math.sqrt(numStars));
        const cellWidth = canvas.width / gridSize;
        const cellHeight = canvas.height / gridSize;
        
        let starsCreated = 0;
        for (let i = 0; i < gridSize && starsCreated < numStars; i++) {
            for (let j = 0; j < gridSize && starsCreated < numStars; j++) {
                // Random position within this grid cell
                const x = (i * cellWidth) + random(0, cellWidth);
                const y = (j * cellHeight) + random(0, cellHeight);
                const star = new BackgroundStar(x, y);
                star.canvas = canvas; // Set canvas reference
                this.stars.push(star);
                starsCreated++;
            }
        }
        
        // Create background asteroids
        const numAsteroids = 10;
        for (let i = 0; i < numAsteroids; i++) {
            this.asteroids.push(new BackgroundAsteroid(
                random(0, canvas.width),
                random(0, canvas.height),
                canvas.width,
                canvas.height
            ));
        }
    }

    update(deltaTime) {
        // Update bokeh particles
        for (const particle of this.bokehParticles) {
            particle.update(deltaTime);
        }

        // Update stars
        for (const star of this.stars) {
            star.update(deltaTime);
        }
        
        // Update asteroids
        for (const asteroid of this.asteroids) {
            asteroid.update(deltaTime);
        }
        
        // Check asteroid collisions
        for (let i = 0; i < this.asteroids.length; i++) {
            for (let j = i + 1; j < this.asteroids.length; j++) {
                if (this.asteroids[i].collidesWith(this.asteroids[j])) {
                    this.asteroids[i].bounce(this.asteroids[j]);
                }
            }
        }

        // Update shooting star timing and creation
        const now = performance.now();
        if (!this.shootingStar && now - this.lastShootingStarTime > this.nextShootingStarDelay) {
            this.shootingStar = new ShootingStar(this.canvas);
            this.lastShootingStarTime = now;
            this.nextShootingStarDelay = random(10000, 20000); // Set next delay 10-20 seconds
        }
        
        // Update existing shooting star
        if (this.shootingStar) {
            this.shootingStar.update(deltaTime);
            if (!this.shootingStar.active) {
                this.shootingStar = null;
            }
        }
    }

    draw(ctx) {
        // Draw bokeh first (behind everything)
        for (const particle of this.bokehParticles) {
            particle.draw(ctx);
        }

        // Draw stars
        for (const star of this.stars) {
            star.draw(ctx);
        }
        
        // Draw asteroids
        for (const asteroid of this.asteroids) {
            asteroid.draw(ctx);
        }

        // Draw shooting star
        if (this.shootingStar) {
            this.shootingStar.draw(ctx);
        }
    }

    handleResize() {
        // Update bokeh particles with new canvas size
        for (const particle of this.bokehParticles) {
            particle.canvas = this.canvas;
            particle.reset();
        }

        // Completely redistribute all stars in the new canvas size
        const gridSize = Math.ceil(Math.sqrt(this.stars.length));
        const cellWidth = this.canvas.width / gridSize;
        const cellHeight = this.canvas.height / gridSize;
        
        let starIndex = 0;
        for (let i = 0; i < gridSize && starIndex < this.stars.length; i++) {
            for (let j = 0; j < gridSize && starIndex < this.stars.length; j++) {
                // Random position within this grid cell
                this.stars[starIndex].x = (i * cellWidth) + random(0, cellWidth);
                this.stars[starIndex].y = (j * cellHeight) + random(0, cellHeight);
                this.stars[starIndex].canvas = this.canvas; // Update canvas reference
                starIndex++;
            }
        }
        
        // Recreate background asteroids with new canvas dimensions
        const numAsteroids = this.asteroids.length;
        this.asteroids = [];
        for (let i = 0; i < numAsteroids; i++) {
            this.asteroids.push(new BackgroundAsteroid(
                random(0, this.canvas.width),
                random(0, this.canvas.height),
                this.canvas.width,
                this.canvas.height
            ));
        }

        // Reset shooting star if active
        if (this.shootingStar) {
            this.shootingStar = null;
        }
    }
} 
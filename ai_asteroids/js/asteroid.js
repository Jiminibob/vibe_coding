class Asteroid extends Entity {
    constructor(x, y, size = 'LARGE', velocity = null) {
        super(x, y, ASTEROID_SIZES[size], 'gray');
        this.size = size;
        
        if (velocity) {
            this.velocity = velocity;
        } else {
            // Calculate direction towards center with variation
            const centerX = window.innerWidth / 2 + (Math.random() - 0.5) * 400; // 200px radius variation
            const centerY = CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 400;
            
            // Calculate angle towards varied center point
            const dx = centerX - x;
            const dy = centerY - y;
            const angleToCenter = Math.atan2(dy, dx);
            
            // Add some randomness to the angle (±15 degrees)
            const variation = (Math.random() - 0.5) * Math.PI / 6;
            const finalAngle = angleToCenter + variation;
            
            // Set velocity based on the calculated angle
            this.velocity.x = Math.cos(finalAngle) * ASTEROID_SPEED;
            this.velocity.y = Math.sin(finalAngle) * ASTEROID_SPEED;
        }
        
        // Random rotation
        this.rotationVelocity = (Math.random() - 0.5) * 2;
        
        // Generate random shape vertices
        this.vertices = this.generateVertices();
    }

    generateVertices() {
        const vertices = [];
        const segments = 12;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const variance = 0.3; // How much the radius can vary
            const radius = this.radius * (1 + (Math.random() - 0.5) * variance);
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        return vertices;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw asteroid shape
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        
        // Fill the asteroid
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw white outer border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw inner dark border for depth
        ctx.strokeStyle = 'darkgray';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    split() {
        if (this.size === 'SMALL') return [];

        const newSize = this.size === 'LARGE' ? 'MEDIUM' : 'SMALL';
        const newAsteroids = [];
        const speedMultiplier = 1.2; // Slightly faster than parent

        // Create 3 smaller asteroids with controlled velocities
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const distance = this.radius / 2;
            
            // Calculate position offset from parent
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            // Calculate new velocity based on split direction
            const velocity = {
                x: Math.cos(angle) * ASTEROID_SPEED * speedMultiplier,
                y: Math.sin(angle) * ASTEROID_SPEED * speedMultiplier
            };
            
            newAsteroids.push(new Asteroid(x, y, newSize, velocity));
        }

        return newAsteroids;
    }

    bounce(other) {
        // Calculate normal vector
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / distance;
        const ny = dy / distance;

        // Calculate relative velocity
        const vx = this.velocity.x - other.velocity.x;
        const vy = this.velocity.y - other.velocity.y;

        // Calculate relative velocity in terms of the normal direction
        const velocityAlongNormal = (vx * nx + vy * ny);

        // Do not resolve if objects are moving apart
        if (velocityAlongNormal > 0) return;

        // Calculate restitution (bounciness) - reduced from 0.8 to 0.5
        const restitution = 0.5;

        // Calculate impulse scalar
        const j = -(1 + restitution) * velocityAlongNormal;

        // Apply impulse with a maximum cap
        const maxImpulse = ASTEROID_SPEED * 1.5; // Cap the maximum impulse
        const clampedImpulseX = Math.max(-maxImpulse, Math.min(maxImpulse, j * nx));
        const clampedImpulseY = Math.max(-maxImpulse, Math.min(maxImpulse, j * ny));

        // Apply clamped impulse
        this.velocity.x -= clampedImpulseX;
        this.velocity.y -= clampedImpulseY;
        other.velocity.x += clampedImpulseX;
        other.velocity.y += clampedImpulseY;

        // Cap final velocities
        const capVelocity = (obj) => {
            const speed = Math.sqrt(obj.velocity.x * obj.velocity.x + obj.velocity.y * obj.velocity.y);
            if (speed > ASTEROID_SPEED * 1.5) {
                const scale = (ASTEROID_SPEED * 1.5) / speed;
                obj.velocity.x *= scale;
                obj.velocity.y *= scale;
            }
        };

        capVelocity(this);
        capVelocity(other);

        // Add some random rotation (reduced from 2 to 1)
        this.rotationVelocity = (Math.random() - 0.5);
        other.rotationVelocity = (Math.random() - 0.5);
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        // Call parent update with canvas dimensions
        super.update(deltaTime, canvasWidth, canvasHeight);
    }
} 
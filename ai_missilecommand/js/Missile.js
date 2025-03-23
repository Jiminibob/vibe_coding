class Missile {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        
        // Calculate direction
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * CONSTANTS.MISSILE.SPEED;
        this.vy = (dy / distance) * CONSTANTS.MISSILE.SPEED;

        // Trail effect
        this.trail = [];
        this.trailTimer = 0;
    }

    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Update trail
        this.trailTimer += deltaTime;
        if (this.trailTimer >= CONSTANTS.MISSILE.TRAIL_DECAY) {
            this.trail.push({
                x: this.x,
                y: this.y,
                alpha: 1
            });
            this.trailTimer = 0;

            // Limit trail length
            if (this.trail.length > CONSTANTS.MISSILE.TRAIL_LENGTH) {
                this.trail.shift();
            }
        }

        // Update trail points alpha
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].alpha -= deltaTime;
        }

        // Check if missile has reached target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distanceSquared = dx * dx + dy * dy;
        return distanceSquared < 25; // Return true if missile has reached target
    }

    render(ctx) {
        // Draw trail
        if (this.trail.length >= 2) {
            ctx.lineWidth = CONSTANTS.MISSILE.WIDTH;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw trail segments
            for (let i = 1; i < this.trail.length; i++) {
                const start = this.trail[i - 1];
                const end = this.trail[i];
                
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                
                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = CONSTANTS.COLORS.PRIMARY;
                ctx.strokeStyle = `rgba(0, 255, 255, ${end.alpha})`;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Draw line from last trail point to current position
            if (this.trail.length > 0) {
                const lastPoint = this.trail[this.trail.length - 1];
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = CONSTANTS.COLORS.PRIMARY;
                ctx.stroke();
            }
        }

        // Draw missile
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONSTANTS.MISSILE.WIDTH, 0, Math.PI * 2);
        ctx.fillStyle = CONSTANTS.COLORS.PRIMARY;
        ctx.fill();

        // Add glow to missile
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONSTANTS.COLORS.PRIMARY;
        ctx.strokeStyle = CONSTANTS.COLORS.PRIMARY;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
} 
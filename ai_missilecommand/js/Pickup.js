class Pickup {
    constructor(x, y, direction, speed = 100, type = 'explosion_radius') {
        this.x = x;
        this.y = y;
        this.direction = direction; // 1 for right, -1 for left
        this.speed = speed;
        this.radius = 10;
        this.collected = false;
        this.type = type;
        this.rotation = 0;
        this.rotationSpeed = Math.PI; // Rotate 180 degrees per second
    }

    update(deltaTime) {
        // Move horizontally
        this.x += this.speed * this.direction * deltaTime;
        
        // Rotate the pickup
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Return true if out of bounds
        return this.x < -this.radius || this.x > CONSTANTS.MAX_GAME_WIDTH + this.radius;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw the pickup
        ctx.beginPath();
        
        // Different shapes based on pickup type
        if (this.type === 'explosion_radius') {
            // Draw a plus shape for explosion radius
            ctx.moveTo(-this.radius, 0);
            ctx.lineTo(this.radius, 0);
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(0, this.radius);
        } else if (this.type === 'trajectory') {
            // Draw a target-like shape for trajectory pickup
            ctx.moveTo(-this.radius, -this.radius);
            ctx.lineTo(this.radius, this.radius);
            ctx.moveTo(this.radius, -this.radius);
            ctx.lineTo(-this.radius, this.radius);
            
            // Draw a smaller circle in the middle
            ctx.moveTo(this.radius * 0.5, 0);
            ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        } else if (this.type === 'cooldown_reduction') {
            // Draw a clock-like shape for cooldown reduction
            ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 1.5);
            
            // Draw clock hands
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -this.radius * 0.7);
            ctx.moveTo(0, 0);
            ctx.lineTo(this.radius * 0.5, 0);
        } else if (this.type === 'asteroid_destroyer') {
            // Draw a star-like shape for asteroid destroyer
            const innerRadius = this.radius * 0.4;
            const outerRadius = this.radius * 0.9;
            const spikes = 8;
            
            // Draw star
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i / (spikes * 2)) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
        } else if (this.type === 'launcher_repair') {
            // Draw a wrench-like shape for launcher repair
            // Handle
            ctx.moveTo(-this.radius * 0.7, -this.radius * 0.7);
            ctx.lineTo(this.radius * 0.3, this.radius * 0.3);
            
            // Head top
            ctx.moveTo(-this.radius * 0.7, -this.radius * 0.7);
            ctx.lineTo(-this.radius * 0.9, -this.radius * 0.4);
            
            // Head bottom
            ctx.moveTo(-this.radius * 0.3, -this.radius * 0.3);
            ctx.lineTo(-this.radius * 0.5, 0);
            
            // Draw other end of wrench
            ctx.moveTo(this.radius * 0.3, this.radius * 0.3);
            ctx.lineTo(this.radius * 0.9, this.radius * 0.4);
            ctx.lineTo(this.radius * 0.7, this.radius * 0.8);
        } else if (this.type === 'time_freeze') {
            // Draw a snowflake-like shape for time freeze
            const spikes = 6;
            
            // Draw spikes
            for (let i = 0; i < spikes; i++) {
                const angle = (i / spikes) * Math.PI * 2;
                const x1 = Math.cos(angle) * this.radius * 0.9;
                const y1 = Math.sin(angle) * this.radius * 0.9;
                
                // Main spike
                ctx.moveTo(0, 0);
                ctx.lineTo(x1, y1);
                
                // Cross lines
                const crossAngle1 = angle + Math.PI / 6;
                const crossAngle2 = angle - Math.PI / 6;
                const crossLength = this.radius * 0.4;
                const midPoint = 0.6; // 60% along the main spike
                
                const midX = Math.cos(angle) * this.radius * midPoint;
                const midY = Math.sin(angle) * this.radius * midPoint;
                
                const crossX1 = midX + Math.cos(crossAngle1) * crossLength;
                const crossY1 = midY + Math.sin(crossAngle1) * crossLength;
                
                const crossX2 = midX + Math.cos(crossAngle2) * crossLength;
                const crossY2 = midY + Math.sin(crossAngle2) * crossLength;
                
                ctx.moveTo(midX, midY);
                ctx.lineTo(crossX1, crossY1);
                
                ctx.moveTo(midX, midY);
                ctx.lineTo(crossX2, crossY2);
            }
        }
        
        // Style
        if (this.type === 'time_freeze') {
            ctx.strokeStyle = CONSTANTS.COLORS.FREEZE;
            ctx.shadowColor = CONSTANTS.COLORS.FREEZE;
        } else {
            ctx.strokeStyle = CONSTANTS.COLORS.SUCCESS;
            ctx.shadowColor = CONSTANTS.COLORS.SUCCESS;
        }
        
        ctx.lineWidth = 2;
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        // Draw outline circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    checkCollision(explosion) {
        if (this.collected) return false;
        
        const dx = this.x - explosion.x;
        const dy = this.y - explosion.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= explosion.radius + this.radius;
    }

    collect(game) {
        if (this.collected) return;
        
        this.collected = true;
        
        // Apply pickup effect
        switch(this.type) {
            case 'explosion_radius':
                CONSTANTS.EXPLOSION.MAX_RADIUS *= 1.1; // Increase by 10%
                break;
            case 'trajectory':
                CONSTANTS.TRAJECTORY.VISIBLE = true; // Enable trajectory lines
                break;
            case 'cooldown_reduction':
                CONSTANTS.LAUNCHER.COOLDOWN *= 0.75; // Reduce cooldown by 25%
                break;
            case 'asteroid_destroyer':
                // The actual explosion of asteroids is handled in PlayState
                // Set a flag for PlayState to detect
                game.states.play.destroyAllAsteroids = true;
                break;
            case 'launcher_repair':
                // The actual launcher repair is handled in PlayState
                game.states.play.repairLauncher = true;
                break;
            case 'time_freeze':
                // The actual time freeze effect is handled in PlayState
                game.states.play.timeFreeze = true;
                game.states.play.timeFreezeTimer = 0;
                break;
        }
    }
} 
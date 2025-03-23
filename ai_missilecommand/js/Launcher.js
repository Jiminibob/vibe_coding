class Launcher {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONSTANTS.LAUNCHER.WIDTH;
        this.height = CONSTANTS.LAUNCHER.HEIGHT;
        this.cooldown = 0;
        this.destroyed = false;
    }

    update(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - deltaTime * 1000);
        }
    }

    canLaunch() {
        return !this.destroyed && this.cooldown === 0;
    }

    launch(targetX, targetY) {
        if (!this.canLaunch()) return null;
        
        // Start cooldown
        this.cooldown = CONSTANTS.LAUNCHER.COOLDOWN;

        // Create and return new missile
        const launchY = this.y - this.height;
        return new Missile(this.x, launchY, targetX, targetY);
    }

    checkCollision(asteroid) {
        if (this.destroyed) return false;

        const bounds = this.getBounds();
        const dx = asteroid.x - (bounds.x + bounds.width/2);
        const dy = asteroid.y - (bounds.y + bounds.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= asteroid.radius + Math.min(bounds.width, bounds.height) / 2;
    }

    destroy() {
        this.destroyed = true;
    }

    render(ctx) {
        if (this.destroyed) return;

        // Calculate current height based on cooldown
        const cooldownPercent = this.cooldown / CONSTANTS.LAUNCHER.COOLDOWN;
        const currentHeight = this.height * (1 - cooldownPercent);

        // Choose color based on state
        const color = this.canLaunch() ? CONSTANTS.COLORS.PRIMARY : CONSTANTS.COLORS.EXPLOSION;

        // Draw launcher outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Add neon glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        
        // Draw the launcher outline, growing from bottom
        ctx.strokeRect(
            this.x - this.width/2,
            this.y - currentHeight,
            this.width,
            currentHeight
        );
        
        ctx.shadowBlur = 0;
    }

    getBounds() {
        if (this.destroyed) {
            return { x: this.x, y: this.y, width: 0, height: 0 };
        }

        // Use current height for collision detection
        const cooldownPercent = this.cooldown / CONSTANTS.LAUNCHER.COOLDOWN;
        const currentHeight = this.height * (1 - cooldownPercent);
        return {
            x: this.x - this.width/2,
            y: this.y - currentHeight,
            width: this.width,
            height: currentHeight
        };
    }
} 
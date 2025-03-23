class Base {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONSTANTS.BASE.WIDTH;
        this.height = CONSTANTS.BASE.HEIGHT;
        this.maxHp = CONSTANTS.BASE.MAX_HP;
        this.currentHp = this.maxHp;
    }

    takeDamage(amount) {
        this.currentHp = Math.max(0, this.currentHp - amount);
        return this.currentHp === 0;
    }

    render(ctx) {
        // Calculate current height based on health
        const currentHeight = (this.currentHp / this.maxHp) * this.height;
        
        // Draw base structure outline
        ctx.strokeStyle = CONSTANTS.COLORS.BASE;
        ctx.lineWidth = 2;
        
        // Add neon glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONSTANTS.COLORS.BASE;
        
        // Draw the base outline at current height
        ctx.strokeRect(
            this.x - this.width/2,
            this.y - currentHeight,
            this.width,
            currentHeight
        );
        
        ctx.shadowBlur = 0;
    }

    getBounds() {
        // Use current height for collision detection
        const currentHeight = (this.currentHp / this.maxHp) * this.height;
        return {
            x: this.x - this.width/2,
            y: this.y - currentHeight,
            width: this.width,
            height: currentHeight
        };
    }
} 
class Shield extends Entity {
    constructor(x, y) {
        super(x, y, 23, 'rgba(0, 255, 255, 0.8)');
        this.pulsePhase = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Pulse animation
        this.pulsePhase += deltaTime * 5;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }
    }

    draw(ctx) {
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.2;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Add glow effect
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowBlur = 15;
        
        // Draw outer ring
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * pulseScale, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw inner shield symbol
        ctx.beginPath();
        ctx.moveTo(0, -this.radius * 0.5);
        ctx.lineTo(this.radius * 0.5, this.radius * 0.5);
        ctx.lineTo(-this.radius * 0.5, this.radius * 0.5);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.restore();
    }
} 
class TextPopup {
    constructor(x, y, text, color = CONSTANTS.COLORS.SUCCESS) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.timeElapsed = 0;
        this.alpha = 0; // Start invisible and fade in
        this.scale = 0.5;
        this.duration = 1500; // 1.5 seconds total duration
        this.fadeInTime = 200; // Time to fade in (ms)
        this.fadeOutStart = this.duration * 0.7; // When to start fading out
    }

    update(deltaTime) {
        this.timeElapsed += deltaTime * 1000;
        
        // Handle fade in
        if (this.timeElapsed < this.fadeInTime) {
            this.alpha = this.timeElapsed / this.fadeInTime;
            this.scale = 0.5 + (0.5 * this.alpha);
        } else {
            this.alpha = 1;
            this.scale = 1;
        }
        
        // Float upward slowly
        const speed = 30; // pixels per second
        this.y -= speed * deltaTime;
        
        // Handle fade out
        if (this.timeElapsed > this.fadeOutStart) {
            const fadeOutProgress = (this.timeElapsed - this.fadeOutStart) / (this.duration - this.fadeOutStart);
            this.alpha = 1 - fadeOutProgress;
        }
        
        // Return true if animation is complete
        return this.timeElapsed >= this.duration;
    }

    render(ctx) {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Draw text
        const fontSize = Math.floor(18 * this.scale);
        ctx.font = `${fontSize}px ${CONSTANTS.FONT.FAMILY}`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        
        // Add glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        
        // Draw text
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.restore();
    }
} 
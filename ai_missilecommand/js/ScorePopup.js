class ScorePopup {
    constructor(x, y, points, multiplier) {
        this.x = x;
        this.y = y;
        this.points = points;
        this.multiplier = multiplier;
        this.timeElapsed = 0;
        this.alpha = 1;
        this.scale = 0;
        
        // Separate positions for points and multiplier
        this.pointsY = y;
        this.multiplierY = y;
    }

    update(deltaTime) {
        this.timeElapsed += deltaTime * 1000;
        
        // Scale up quickly at start
        if (this.timeElapsed < 200) {
            this.scale = Math.min(1, this.timeElapsed / 200);
        }

        // Float upward
        const speed = 50; // pixels per second
        this.pointsY -= speed * deltaTime;
        this.multiplierY -= speed * deltaTime;

        // Fade out near end of duration
        if (this.timeElapsed > CONSTANTS.SCORING.POPUP_DURATION * 0.7) {
            this.alpha = 1 - ((this.timeElapsed - (CONSTANTS.SCORING.POPUP_DURATION * 0.7)) / 
                             (CONSTANTS.SCORING.POPUP_DURATION * 0.3));
        }

        // Return true if animation is complete
        return this.timeElapsed >= CONSTANTS.SCORING.POPUP_DURATION;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Draw points
        ctx.font = `${Math.floor(24 * this.scale)}px ${CONSTANTS.FONT.FAMILY}`;
        ctx.fillStyle = CONSTANTS.COLORS.PRIMARY;
        ctx.textAlign = 'center';
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONSTANTS.COLORS.PRIMARY;
        
        // Draw points
        ctx.fillText(`${this.points}`, this.x, this.pointsY);

        // Draw multiplier if greater than 1
        if (this.multiplier > 1) {
            ctx.fillStyle = CONSTANTS.COLORS.SECONDARY;
            ctx.shadowColor = CONSTANTS.COLORS.SECONDARY;
            ctx.fillText(`x${this.multiplier}`, this.x, this.multiplierY + 25);
        }

        ctx.restore();
    }
} 
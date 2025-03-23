class WelcomeState extends GameState {
    constructor(game) {
        super(game);
        this.playButton = null;
    }

    render(ctx) {
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;

        // Draw title
        this.drawText(
            ctx,
            "AI MISSILE COMMAND",
            centerX,
            centerY - 100,
            CONSTANTS.FONT.SIZE.LARGE
        );

        // Draw play button
        this.playButton = this.drawButton(
            ctx,
            "PLAY",
            centerX,
            centerY + 50,
            200,
            60
        );

        // Draw neon glow effects
        ctx.shadowBlur = 20;
        ctx.shadowColor = CONSTANTS.COLORS.PRIMARY;
        this.drawText(
            ctx,
            "AI MISSILE COMMAND",
            centerX,
            centerY - 100,
            CONSTANTS.FONT.SIZE.LARGE
        );
        ctx.shadowBlur = 0;
    }

    handleClick(x, y) {
        if (this.playButton && this.isPointInRect(x, y, this.playButton)) {
            this.game.setState('instructions');
        }
    }
} 
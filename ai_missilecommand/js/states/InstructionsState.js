class InstructionsState extends GameState {
    constructor(game) {
        super(game);
        this.continueButton = null;
    }

    render(ctx) {
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;

        // Draw title
        this.drawText(
            ctx,
            "HOW TO PLAY",
            centerX,
            100,
            CONSTANTS.FONT.SIZE.LARGE
        );

        // Draw instructions
        const instructions = [
            "DEFEND YOUR BASES FROM INCOMING ASTEROIDS",
            "CLICK ANYWHERE ON SCREEN TO LAUNCH A MISSILE",
            "MISSILES LAUNCH FROM THE NEAREST AVAILABLE LAUNCHER",
            "PROTECT YOUR BASES AND SURVIVE AS LONG AS POSSIBLE",
            "DESTROY MULTIPLE ASTEROIDS WITH ONE EXPLOSION FOR BONUS POINTS"
        ];

        instructions.forEach((text, index) => {
            this.drawText(
                ctx,
                text,
                centerX,
                200 + (index * 60),
                CONSTANTS.FONT.SIZE.MEDIUM
            );
        });

        // Draw continue button
        this.continueButton = this.drawButton(
            ctx,
            "CONTINUE",
            centerX,
            centerY + 250,
            200,
            60
        );

        // Add neon glow to title
        ctx.shadowBlur = 20;
        ctx.shadowColor = CONSTANTS.COLORS.PRIMARY;
        this.drawText(
            ctx,
            "HOW TO PLAY",
            centerX,
            100,
            CONSTANTS.FONT.SIZE.LARGE
        );
        ctx.shadowBlur = 0;
    }

    handleClick(x, y) {
        if (this.continueButton && this.isPointInRect(x, y, this.continueButton)) {
            this.game.setState('play');
        }
    }
} 
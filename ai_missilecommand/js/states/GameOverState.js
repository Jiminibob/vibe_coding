class GameOverState extends GameState {
    constructor(game) {
        super(game);
        this.replayButton = null;
        this.finalScore = 0;
        this.timeSurvived = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
    }

    enter() {
        this.finalScore = this.game.score;
        this.timeSurvived = Math.floor((this.game.currentTime - this.game.startTime) / 1000);
        
        // Update high score
        if (this.finalScore > this.highScore) {
            this.highScore = this.finalScore;
            localStorage.setItem('highScore', this.highScore);
        }
    }

    render(ctx) {
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;

        // Draw "Game Over" text
        ctx.shadowBlur = 20;
        ctx.shadowColor = CONSTANTS.COLORS.DANGER;
        this.drawText(
            ctx,
            "GAME OVER",
            centerX,
            centerY - 150,
            CONSTANTS.FONT.SIZE.LARGE,
            CONSTANTS.COLORS.DANGER
        );
        ctx.shadowBlur = 0;

        // Draw stats
        const minutes = Math.floor(this.timeSurvived / 60);
        const seconds = this.timeSurvived % 60;
        
        this.drawText(
            ctx,
            `Time Survived: ${minutes}:${seconds.toString().padStart(2, '0')}`,
            centerX,
            centerY - 50
        );

        this.drawText(
            ctx,
            `Final Score: ${this.finalScore}`,
            centerX,
            centerY
        );

        this.drawText(
            ctx,
            `High Score: ${this.highScore}`,
            centerX,
            centerY + 50
        );

        // Draw replay button
        this.replayButton = this.drawButton(
            ctx,
            "PLAY AGAIN",
            centerX,
            centerY + 150,
            200,
            60
        );
    }

    handleClick(x, y) {
        if (this.replayButton && this.isPointInRect(x, y, this.replayButton)) {
            // Reset game state and start new game
            this.game.score = 0;
            this.game.setState('play');
        }
    }
} 
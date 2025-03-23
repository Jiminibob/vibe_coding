class GameState {
    constructor(game) {
        this.game = game;
    }

    enter() {
        // Called when entering this state
    }

    exit() {
        // Called when exiting this state
    }

    update(deltaTime) {
        // Called every frame to update game logic
    }

    render(ctx) {
        // Called every frame to render the state
    }

    handleClick(x, y) {
        // Called when the canvas is clicked
    }

    // Utility methods for all states
    drawText(ctx, text, x, y, size = CONSTANTS.FONT.SIZE.MEDIUM, color = CONSTANTS.COLORS.PRIMARY, align = 'center') {
        ctx.font = `${size} ${CONSTANTS.FONT.FAMILY}`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    }

    drawButton(ctx, text, x, y, width, height) {
        // Draw button background
        ctx.strokeStyle = CONSTANTS.COLORS.PRIMARY;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - width/2, y - height/2, width, height);

        // Draw button text
        this.drawText(ctx, text, x, y + 8); // +8 for vertical centering

        // Return hit box for click detection
        return {
            x: x - width/2,
            y: y - height/2,
            width: width,
            height: height
        };
    }

    isPointInRect(x, y, rect) {
        return x >= rect.x && 
               x <= rect.x + rect.width && 
               y >= rect.y && 
               y <= rect.y + rect.height;
    }
} 
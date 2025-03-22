// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas');
    
    // Create and start game
    const game = new Game(canvas);
}); 
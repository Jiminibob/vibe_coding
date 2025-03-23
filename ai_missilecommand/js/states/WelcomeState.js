class WelcomeState {
    constructor(game) {
        this.game = game;
        
        // Setup event listener for start button
        document.getElementById('start-button')?.addEventListener('click', () => {
            document.getElementById('welcome-screen').classList.remove('active');
            document.getElementById('instructions-screen').classList.add('active');
        });

        // Setup event listener for continue button
        document.getElementById('continue-button')?.addEventListener('click', () => {
            document.getElementById('instructions-screen').classList.remove('active');
            this.game.setState('play');
        });
    }

    enter() {
        // Show welcome screen
        document.getElementById('welcome-screen').classList.add('active');
    }

    exit() {
        // Hide welcome screen
        document.getElementById('welcome-screen').classList.remove('active');
    }

    update(deltaTime) {
        // No updates needed for welcome screen
    }

    render(ctx) {
        // No canvas rendering needed - UI is handled by DOM
    }

    handleClick(x, y) {
        // Click handling is done through DOM event listeners
    }
} 
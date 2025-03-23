class GameOverState extends GameState {
    constructor(game) {
        super(game);
        this.finalScore = 0;
        this.timeSurvived = 0;
        this.handleRestart = () => {
            console.log("Restart button clicked");
            
            // Reset game state
            this.game.score = 0;
            
            // Force PlayState to reinitialize
            const playState = this.game.states.play;
            
            // Reset PlayState arrays
            playState.bases = [];
            playState.launchers = [];
            playState.missiles = [];
            playState.asteroids = [];
            playState.explosions = [];
            playState.scorePopups = [];
            playState.textPopups = [];
            playState.targetMarkers = [];
            playState.deResEffects = [];
            playState.pickups = [];
            playState.destroyedLauncherPositions = [];
            
            // Reset timers
            playState.asteroidSpawnTimer = 0;
            playState.pickupSpawnTimer = 0;
            playState.difficultyLevel = 0;
            playState.gameOverSequenceStarted = false;
            playState.gameOverTimer = 0;
            
            // Reset asteroid speed and spawn rate to initial values
            playState.currentAsteroidSpeed = CONSTANTS.ASTEROID.INITIAL_SPEED;
            playState.currentSpawnRate = CONSTANTS.ASTEROID.INITIAL_SPAWN_RATE;
            
            // Reset other game settings
            CONSTANTS.EXPLOSION.MAX_RADIUS = 50; // Reset explosion radius to default
            CONSTANTS.TRAJECTORY.VISIBLE = false; // Reset trajectory visibility
            CONSTANTS.LAUNCHER.COOLDOWN = 1000; // Reset launcher cooldown to default
            
            // Start new game and transition state
            this.game.setState('play');
        };
    }

    enter() {
        this.finalScore = this.game.score;
        this.timeSurvived = Math.floor((this.game.currentTime - this.game.startTime) / 1000);
        
        // Format time for display
        const minutes = Math.floor(this.timeSurvived / 60);
        const seconds = this.timeSurvived % 60;
        const milliseconds = Math.floor((this.game.currentTime - this.game.startTime) % 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
        
        // Get current high score
        const storedHighScore = localStorage.getItem('highScore');
        const highScore = storedHighScore ? parseInt(storedHighScore) : 0;
        
        const highScoreContainer = document.getElementById('high-score-container');
        const highScoreLabel = document.getElementById('high-score-label');
        const highScoreDisplay = document.getElementById('high-score');
        
        // Check if we have a new high score (including first play)
        if (!storedHighScore || this.finalScore > highScore) {
            localStorage.setItem('highScore', this.finalScore.toString());
            highScoreLabel.textContent = 'NEW HIGH SCORE';
            highScoreContainer.classList.add('new-record');
        } else {
            highScoreLabel.textContent = 'HIGH SCORE:';
            highScoreDisplay.textContent = highScore.toString();
            highScoreContainer.classList.remove('new-record');
        }
        
        // Update DOM elements
        document.getElementById('final-score').textContent = this.finalScore;
        document.getElementById('final-time').textContent = timeString;
        
        // Setup restart button handler
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            // Remove previous click listeners (in case there are duplicates)
            restartButton.removeEventListener('click', this.handleRestart);
            
            // Add the listener again
            restartButton.addEventListener('click', this.handleRestart);
            
            // Also add direct onclick for testing
            restartButton.onclick = this.handleRestart;
        }
        
        // Show game over screen
        document.getElementById('game-over-screen').classList.add('active');
    }

    exit() {
        // Hide game over screen
        document.getElementById('game-over-screen').classList.remove('active');
        // Reset high score styling
        document.getElementById('high-score-container').classList.remove('new-record');
        // Remove restart button handler
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.removeEventListener('click', this.handleRestart);
        }
    }

    update(deltaTime) {
        // No updates needed for game over screen
    }

    render(ctx) {
        // No canvas rendering needed - UI is handled by DOM
    }

    handleClick(x, y) {
        // Click handling is done through DOM event listeners
    }
} 
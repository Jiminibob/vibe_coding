class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeDisplay = document.getElementById('time-display');
        this.scoreDisplay = document.getElementById('score-display');
        
        // Create background
        this.background = new Background(this.canvas);

        // Game state
        this.currentState = null;
        this.states = {
            welcome: new WelcomeState(this),
            instructions: new InstructionsState(this),
            play: new PlayState(this),
            gameOver: new GameOverState(this)
        };

        // Game properties
        this.score = 0;
        this.startTime = 0;
        this.currentTime = 0;
        this.isRunning = false;
        this.isPaused = false;

        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.handleClick = this.handleClick.bind(this);

        // Setup
        this.setupEventListeners();
        this.handleResize();
        this.setState('welcome');
    }

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        this.canvas.addEventListener('click', this.handleClick);
    }

    handleResize() {
        const containerHeight = window.innerHeight;
        const aspectRatio = Math.min(window.innerWidth / CONSTANTS.MAX_GAME_WIDTH, containerHeight / CONSTANTS.CANVAS_HEIGHT);
        
        this.canvas.width = Math.min(CONSTANTS.MAX_GAME_WIDTH, window.innerWidth);
        this.canvas.height = CONSTANTS.CANVAS_HEIGHT;
        
        // Scale canvas using CSS to maintain aspect ratio
        this.canvas.style.width = `${this.canvas.width * aspectRatio}px`;
        this.canvas.style.height = `${CONSTANTS.CANVAS_HEIGHT * aspectRatio}px`;

        // Reinitialize background grid with new dimensions
        this.background.handleResize();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }

    handleClick(event) {
        if (!this.currentState) return;

        // Convert click coordinates to canvas space
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        this.currentState.handleClick(x, y);
    }

    setState(stateName) {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentState = this.states[stateName];
        this.currentState.enter();

        // Start the game loop if it's not already running
        if (!this.isRunning) {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.startTime = performance.now();
        this.currentTime = this.startTime;
        this.gameLoop(this.startTime);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.gameLoop();
        }
    }

    gameLoop(timestamp) {
        if (!this.isRunning || this.isPaused) return;

        // Calculate delta time
        const deltaTime = timestamp - this.currentTime;
        this.currentTime = timestamp;

        // Update game time display
        const gameTime = timestamp - this.startTime;
        const minutes = Math.floor(gameTime / 60000);
        const seconds = Math.floor((gameTime % 60000) / 1000);
        const milliseconds = Math.floor(gameTime % 1000);
        this.timeDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and render background
        this.background.update(deltaTime / 1000);  // Convert to seconds
        this.background.render(this.ctx);

        // Update and render current state
        if (this.currentState) {
            this.currentState.update(deltaTime / 1000);
            this.currentState.render(this.ctx);
        }

        requestAnimationFrame(this.gameLoop);
    }

    updateScore(points) {
        this.score += points;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }
} 
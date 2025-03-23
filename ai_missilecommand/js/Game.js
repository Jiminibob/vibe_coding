class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeDisplay = document.getElementById('time-display');
        this.scoreDisplay = document.getElementById('score-display');
        
        // Create background
        this.background = new Background(this.canvas);

        // Setup coordinate updates
        this.setupCoordinateUpdates();

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
        this.isGameActive = false;

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

    setupCoordinateUpdates() {
        // Set initial random positions for each line
        const positions = {
            h1: 20 + Math.random() * 60,
            h2: 20 + Math.random() * 60,
            v1: 20 + Math.random() * 60,
            v2: 20 + Math.random() * 60
        };

        // Apply initial positions
        document.querySelector('.scan-h-1')?.style.setProperty('--pos', `${positions.h1}%`);
        document.querySelector('.scan-h-2')?.style.setProperty('--pos', `${positions.h2}%`);
        document.querySelector('.scan-v-1')?.style.setProperty('--pos', `${positions.v1}%`);
        document.querySelector('.scan-v-2')?.style.setProperty('--pos', `${positions.v2}%`);

        // Update only the numbers every 100ms
        setInterval(() => {
            const scanLines = {
                h1: document.querySelector('.scan-h-1'),
                h2: document.querySelector('.scan-h-2'),
                v1: document.querySelector('.scan-v-1'),
                v2: document.querySelector('.scan-v-2')
            };

            // Update numbers only
            const updateLine = (element) => {
                if (!element) return;
                const num = (Math.random() * 1000).toFixed(3);
                element.setAttribute('data-coord', num);
            };

            // Update each line's numbers
            updateLine(scanLines.h1);
            updateLine(scanLines.h2);
            updateLine(scanLines.v1);
            updateLine(scanLines.v2);
        }, 100);

        // Reset positions when animations complete
        const resetPositions = () => {
            positions.h1 = 20 + Math.random() * 60;
            positions.h2 = 20 + Math.random() * 60;
            positions.v1 = 20 + Math.random() * 60;
            positions.v2 = 20 + Math.random() * 60;

            document.querySelector('.scan-h-1')?.style.setProperty('--pos', `${positions.h1}%`);
            document.querySelector('.scan-h-2')?.style.setProperty('--pos', `${positions.h2}%`);
            document.querySelector('.scan-v-1')?.style.setProperty('--pos', `${positions.v1}%`);
            document.querySelector('.scan-v-2')?.style.setProperty('--pos', `${positions.v2}%`);
        };

        // Listen for animation end and set new positions
        const lines = ['.scan-h-1', '.scan-h-2', '.scan-v-1', '.scan-v-2'];
        lines.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('animationend', resetPositions);
            }
        });
    }

    setupEventListeners() {
        // Add keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Add window event listeners
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        this.canvas.addEventListener('click', this.handleClick);
    }

    handleResize() {
        const containerHeight = window.innerHeight;
        const aspectRatio = window.innerWidth / window.innerHeight;
        
        this.canvas.height = CONSTANTS.CANVAS_HEIGHT;
        this.canvas.width =  this.canvas.height * aspectRatio;
     
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

        // Reset game activity when leaving play state
        if (this.currentState === this.states.play) {
            this.isGameActive = false;
            // Hide HUD
            this.timeDisplay.classList.remove('active');
            this.scoreDisplay.classList.remove('active');
        }

        this.currentState = this.states[stateName];
        this.currentState.enter();

        // Start the game loop if it's not already running
        this.start();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.currentTime = performance.now();
            this.gameLoop(this.currentTime);
        }
    }

    startGameplay() {
        this.isGameActive = true;
        this.score = 0;
        this.startTime = performance.now();
        this.currentTime = this.startTime;
        this.scoreDisplay.textContent = 'Score: 0';
        this.timeDisplay.textContent = 'Time: 00:00:000';
        
        // Show HUD
        this.timeDisplay.classList.add('active');
        this.scoreDisplay.classList.add('active');
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

        // Update game time display only when game is active
        if (this.isGameActive) {
            const gameTime = timestamp - this.startTime;
            const minutes = Math.floor(gameTime / 60000);
            const seconds = Math.floor((gameTime % 60000) / 1000);
            const milliseconds = Math.floor(gameTime % 1000);
            this.timeDisplay.textContent = 
                `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and render background
        this.background.update(deltaTime / 1000);
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
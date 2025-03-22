class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = 'welcome'; // welcome, controls, playing, gameover
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.startTime = 0;
        this.currentTime = 0;
        this.lastFrameTime = performance.now();
        this.finalTime = 0; // Store the final time when game ends
        this.isPaused = false;

        // Touch control properties
        this.touchController = document.getElementById('touchController');
        this.touchStick = this.touchController.querySelector('.touch-stick');
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        this.touchActive = false;
        this.touchCenter = { x: 0, y: 0 };
        this.touchPosition = { x: 0, y: 0 };
        this.maxTouchDistance = 40; // Maximum stick displacement
        this.shootingTouch = null; // Track shooting touch

        // Initialize touch controls but keep them hidden
        if (this.isTouchDevice) {
            this.touchControlsEnabled = true;
        }

        // Create HUD elements
        this.createHUDElements();

        // Initialize background
        this.background = new Background(canvas);

        // Game objects
        this.hero = null;
        this.asteroids = [];
        this.bullets = [];
        this.shield = null;
        this.weaponPickup = null;

        // Timers
        this.lastAsteroidSpawn = 0;
        this.lastShieldSpawn = 0;
        this.lastWeaponSpawn = 0;
        this.nextWeaponLevel = 2;

        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            shoot: false
        };

        // Explosion timing properties
        this.explosionStartTime = 0;
        this.pendingExplosions = [];

        // Performance monitoring
        this.fpsUpdateInterval = 500; // Update FPS display every 500ms
        this.lastFpsUpdate = 0;
        this.frameCount = 0;
        this.currentFps = 0;
        
        // Frame timing
        this.lastFrameTime = performance.now();
        this.targetFrameTime = 1000 / 60; // Target 60 FPS
        this.accumulator = 0;
        this.timeStep = 1 / 60; // Fixed time step for physics

        // Spatial partitioning for collision detection
        this.gridCellSize = 100; // Size of each grid cell
        this.collisionGrid = new Map(); // Grid for spatial partitioning

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.gameLoop = this.gameLoop.bind(this);

        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart);
        this.canvas.addEventListener('touchmove', this.handleTouchMove);
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('resize', this.handleResize);

        // Initial resize
        this.handleResize();

        // Start game loop immediately
        requestAnimationFrame(this.gameLoop);

        // Create welcome screen after starting game loop
        this.createWelcomeScreen();
    }

    createWelcomeScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const container = document.createElement('div');
        container.className = 'welcome-container';

        const title = document.createElement('h1');
        title.className = 'title';
        title.textContent = 'AI Asteroids';

        const subtitle = document.createElement('div');
        subtitle.className = 'subtitle';
        subtitle.textContent = 'Navigate through space, avoid asteroids, and survive as long as you can';
        
        const playButton = document.createElement('button');
        playButton.className = 'button';
        playButton.textContent = 'Start Mission';
        playButton.onclick = () => {
            overlay.remove();
            this.showControlsScreen();
        };
        
        container.appendChild(title);
        container.appendChild(subtitle);
        container.appendChild(playButton);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }

    showControlsScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const container = document.createElement('div');
        container.className = 'welcome-container';
        
        const title = document.createElement('h1');
        title.className = 'title';
        title.textContent = 'Controls';

        const subtitle = document.createElement('div');
        subtitle.className = 'subtitle';
        subtitle.textContent = 'Master these controls to survive in space';
        
        const controls = document.createElement('div');
        controls.className = this.isTouchDevice ? 'controls touch-controls' : 'controls keyboard-controls';
        
        // Show different controls based on device type
        if (this.isTouchDevice) {
            controls.innerHTML = `
                <p>Use the <span>left</span> side of screen for <span>movement</span></p>
                <p>Touch <span>right</span> side to <span>shoot</span></p>
                <p>Survive & Score!</p>
            `;
        } else {
            controls.innerHTML = `
                <p>Move Forward: <span>W / ↑</span></p>
                <p>Move Backward: <span>S / ↓</span></p>
                <p>Rotate Left: <span>A / ←</span></p>
                <p>Rotate Right: <span>D / →</span></p>
                <p>Fire Weapon: <span>Space</span></p>
                <p>Survive & Score!</p>
            `;
        }
        
        const continueButton = document.createElement('button');
        continueButton.className = 'button';
        continueButton.textContent = 'Launch Game';
        continueButton.onclick = () => {
            overlay.remove();
            this.startGame();
        };
        
        container.appendChild(title);
        container.appendChild(subtitle);
        container.appendChild(controls);
        container.appendChild(continueButton);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }

    createHUDElements() {
        // Create HUD container
        this.hudContainer = document.createElement('div');
        this.hudContainer.className = 'hud-container';
        this.hudContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 0;
            right: 0;
            display: none;
            justify-content: space-between;
            padding: 0 20px;
            pointer-events: none;
            z-index: 1000;
        `;

        // Create Time panel
        this.timePanel = document.createElement('div');
        this.timePanel.className = 'welcome-container hud-panel';
        this.timePanel.innerHTML = `
            <p>Time: <span id="timeValue">0:00</span></p>
        `;

        // Create Score panel
        this.scorePanel = document.createElement('div');
        this.scorePanel.className = 'welcome-container hud-panel';
        this.scorePanel.innerHTML = `
            <p>Score: <span id="scoreValue">0</span></p>
        `;

        // Add panels to HUD container
        this.hudContainer.appendChild(this.timePanel);
        this.hudContainer.appendChild(this.scorePanel);

        // Add HUD container to document
        document.body.appendChild(this.hudContainer);

        // Add HUD specific styles
        const style = document.createElement('style');
        style.textContent = `
            .hud-panel {
                width: 180px;
                padding: 10px !important;
                margin: 0 !important;
            }
            .hud-panel p {
                margin: 0;
                text-align: center;
                color: #fff;
                font-size: 20px;
            }
            .hud-panel span {
                color: #FFA500;
            }
        `;
        document.head.appendChild(style);
    }

    startGame() {
        // Show HUD
        if (this.hudContainer) {
            this.hudContainer.style.display = 'flex';
        }
        
        // Reset game state
        this.gameState = 'playing';
        this.score = 0;
        this.startTime = performance.now();
        this.currentTime = this.startTime;
        this.lastFrameTime = this.startTime;
        this.isPaused = false;
        this.explosionParticles = null;

        // Reset game objects
        this.hero = new Hero(this.canvas.width / 2, this.canvas.height / 2);
        this.asteroids = [];
        this.bullets = [];
        this.shield = null;
        this.weaponPickup = null;

        // Reset timers to current time to prevent immediate spawns
        this.lastAsteroidSpawn = this.startTime;
        this.lastShieldSpawn = this.startTime;
        this.lastWeaponSpawn = this.startTime;
        this.nextWeaponLevel = 2;

        // Reset input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            shoot: false
        };

        // Reset background state
        this.background = new Background(this.canvas);
        
        // Ensure canvas is properly sized
        this.handleResize();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
    }

    handleKeyDown(event) {
        if (this.gameState !== 'playing') return;
        
        switch(event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
            case ' ':
                this.keys.shoot = true;
                break;
        }
    }

    handleKeyUp(event) {
        if (this.gameState !== 'playing') return;
        
        switch(event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.shoot = false;
                break;
        }
    }

    handleTouchStart(event) {
        if (this.gameState !== 'playing') return;
        
        const touch = event.touches[0];
        const canvasRect = this.canvas.getBoundingClientRect();
        const touchX = touch.clientX - canvasRect.left;
        
        // Handle movement (left third of screen)
        if (touchX <= canvasRect.width / 3) {
            this.touchActive = true;
            this.touchCenter = {
                x: touch.clientX,
                y: touch.clientY
            };
            this.touchPosition = { ...this.touchCenter };
            
            // Position and show the controller
            this.touchController.style.left = `${this.touchCenter.x}px`;
            this.touchController.style.top = `${this.touchCenter.y}px`;
            this.touchController.style.display = 'block';
            
            // Center the stick initially
            this.touchStick.style.left = '50%';
            this.touchStick.style.top = '50%';
        }
        // Handle shooting (right third of screen)
        else if (touchX >= (canvasRect.width * 2/3)) {
            this.keys.shoot = true;
            this.shootingTouch = touch.identifier;
        }
        
        event.preventDefault();
    }

    handleTouchMove(event) {
        if (!this.touchActive) return;
        
        // Find our movement touch
        let moveTouch = null;
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const canvasRect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - canvasRect.left;
            if (touchX <= canvasRect.width / 3) {
                moveTouch = touch;
                break;
            }
        }
        
        if (!moveTouch) return;
        
        this.touchPosition = {
            x: moveTouch.clientX,
            y: moveTouch.clientY
        };
        
        // Calculate direction and distance from center
        const dx = this.touchPosition.x - this.touchCenter.x;
        const dy = this.touchPosition.y - this.touchCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Limit the stick movement
        const stickDistance = Math.min(distance, this.maxTouchDistance);
        const stickX = 50 + (Math.cos(angle) * stickDistance * 50 / this.maxTouchDistance);
        const stickY = 50 + (Math.sin(angle) * stickDistance * 50 / this.maxTouchDistance);
        
        // Update stick position
        this.touchStick.style.left = `${stickX}%`;
        this.touchStick.style.top = `${stickY}%`;
        
        // Update hero movement
        if (distance > 5) { // Small threshold to prevent tiny movements
            // Set the hero's rotation to match the joystick angle
            this.hero.rotation = angle;
            
            // Calculate velocity based on stick distance and angle
            const speed = (stickDistance / this.maxTouchDistance) * HERO_MOVEMENT_SPEED;
            this.hero.velocity.x = Math.cos(angle) * speed;
            this.hero.velocity.y = Math.sin(angle) * speed;
            
            // Set current speed and movement state for trail emission
            this.hero.currentSpeed = speed;
            this.keys.forward = true; // This triggers the trail emission
        } else {
            // Stop movement if stick is near center
            this.hero.velocity.x = 0;
            this.hero.velocity.y = 0;
            this.hero.currentSpeed = 0;
            this.keys.forward = false;
        }
        
        event.preventDefault();
    }

    handleTouchEnd(event) {
        if (!this.touchActive) return;
        
        this.touchActive = false;
        this.touchController.style.display = 'none';
        
        // Don't stop movement, just hide the controller and stop shooting
        this.keys.shoot = false;
        
        event.preventDefault();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.isPaused = true;
        } else {
            this.isPaused = false;
            this.lastFrameTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    handleResize() {
        // Keep canvas height fixed at 720px
        this.canvas.height = CANVAS_HEIGHT;
        
        // Calculate width based on window aspect ratio while maintaining 720px height
        const windowAspectRatio = window.innerWidth / window.innerHeight;
        this.canvas.width = Math.round(CANVAS_HEIGHT * windowAspectRatio);
        
        // Update any background or game elements that need to know about the new size
        this.background.handleResize();
        
        // Set the canvas scaling through CSS
        this.canvas.style.height = '100vh';
        this.canvas.style.width = 'auto';
    }

    spawnAsteroid() {
        const pos = getRandomEdgePosition(this.canvas.width, this.canvas.height);
        this.asteroids.push(new Asteroid(pos.x, pos.y));
    }

    spawnShield() {
        if (!this.shield && !this.hero.hasShield) {
            const x = random(50, this.canvas.width - 50);
            const y = random(50, this.canvas.height - 50);
            this.shield = new Shield(x, y);
        }
    }

    spawnWeapon() {
        if (!this.weaponPickup && this.nextWeaponLevel <= Object.keys(WEAPONS).length) {
            const x = random(50, this.canvas.width - 50);
            const y = random(50, this.canvas.height - 50);
            this.weaponPickup = new WeaponPickup(x, y, this.nextWeaponLevel);
        }
    }

    update(deltaTime) {
        // Update game state
        this.currentTime = performance.now();

        // Update background
        this.background.update(deltaTime);

        // Update explosion particles in all states
        if (this.explosionParticles) {
            this.explosionParticles = this.explosionParticles.filter(particle => {
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.life -= deltaTime;
                particle.size *= 0.99; // Slowly shrink particles
                return particle.life > 0;
            });

            // If in exploding state and all particles are gone, show game over
            if (this.gameState === 'exploding' && this.explosionParticles.length === 0) {
                this.showGameOverScreen();
            }
        }

        // Update asteroids only if not in exploding state
        if (this.gameState !== 'exploding') {
            // Filter out inactive asteroids first
            this.asteroids = this.asteroids.filter(asteroid => asteroid.active);
            
            // Update remaining active asteroids
            for (let i = 0; i < this.asteroids.length; i++) {
                this.asteroids[i].update(deltaTime, this.canvas.width, this.canvas.height);
                for (let j = i + 1; j < this.asteroids.length; j++) {
                    if (this.asteroids[i].collidesWith(this.asteroids[j])) {
                        this.asteroids[i].bounce(this.asteroids[j]);
                    }
                }
            }
        }

        if (this.gameState !== 'playing') return;

        // Rest of update logic for playing state
        if (this.keys.forward) this.hero.moveForward();
        else if (this.keys.backward) this.hero.moveBackward();
        else this.hero.stopMoving();

        if (this.keys.left) this.hero.rotateLeft();
        else if (this.keys.right) this.hero.rotateRight();
        else this.hero.stopRotating();

        if (this.keys.shoot) {
            const newBullets = this.hero.shoot();
            this.bullets.push(...newBullets);
        }

        this.hero.update(deltaTime, this.canvas.width, this.canvas.height);

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime, this.canvas.width, this.canvas.height);
            return bullet.active;
        });

        if (this.shield) {
            this.shield.update(deltaTime, this.canvas.width, this.canvas.height);
        }

        if (this.weaponPickup) {
            this.weaponPickup.update(deltaTime, this.canvas.width, this.canvas.height);
        }

        // Spawn logic
        const now = performance.now();
        const gameTime = now - this.startTime;

        // Asteroid spawning
        if (now - this.lastAsteroidSpawn >= this.getCurrentAsteroidSpawnInterval(gameTime)) {
            this.spawnAsteroid();
            this.lastAsteroidSpawn = now;
        }

        // Shield spawning
        if (!this.shield && !this.hero.hasShield && now - this.lastShieldSpawn >= SHIELD_SPAWN_INTERVAL) {
            this.spawnShield();
            this.lastShieldSpawn = now;
        }

        // Weapon spawning
        if (!this.weaponPickup && now - this.lastWeaponSpawn >= WEAPON_SPAWN_DELAY) {
            this.spawnWeapon();
            this.lastWeaponSpawn = now;
        }

        // Clear collision grid at the start of each update
        this.collisionGrid.clear();

        // Add all active entities to the collision grid
        if (this.hero && this.hero.active) {
            this.addToCollisionGrid(this.hero);
        }
        for (const asteroid of this.asteroids) {
            if (asteroid.active) {
                this.addToCollisionGrid(asteroid);
            }
        }
        for (const bullet of this.bullets) {
            if (bullet.active) {
                this.addToCollisionGrid(bullet);
            }
        }
        if (this.shield) {
            this.addToCollisionGrid(this.shield);
        }
        if (this.weaponPickup) {
            this.addToCollisionGrid(this.weaponPickup);
        }

        // Check remaining collisions
        this.checkCollisions();
    }

    getCurrentAsteroidSpawnInterval(gameTime) {
        if (gameTime < FIRST_ASTEROID_SPAWN_DELAY) return Infinity;
        
        const progress = Math.min(gameTime / TIME_TO_REACH_MIN_SPAWN, 1);
        return INITIAL_ASTEROID_SPAWN_INTERVAL - 
               (INITIAL_ASTEROID_SPAWN_INTERVAL - MINIMUM_ASTEROID_SPAWN_INTERVAL) * progress;
    }

    checkCollisions() {
        // Bullet vs Asteroid collisions using spatial partitioning
        for (const bullet of this.bullets) {
            if (!bullet.active) continue;
            
            const candidates = this.getCollisionCandidates(bullet);
            for (const asteroid of candidates) {
                if (asteroid.active && asteroid.constructor.name === 'Asteroid' && bullet.collidesWith(asteroid)) {
                    this.handleBulletAsteroidCollision(bullet, asteroid);
                }
            }
        }

        // Hero collisions using spatial partitioning
        if (this.hero.active) {
            const candidates = this.getCollisionCandidates(this.hero);
            for (const entity of candidates) {
                if (!entity.active) continue;

                if (entity.constructor.name === 'Asteroid' && this.hero.collidesWith(entity)) {
                    if (this.hero.hasShield || this.hero.isInvincible) {
                        if (this.hero.hasShield) {
                            this.hero.removeShield();
                            this.hero.makeInvincible(1000);
                            this.lastShieldSpawn = performance.now();
                            const newAsteroids = entity.split();
                            this.asteroids.push(...newAsteroids);
                            entity.destroy();
                            this.score += entity.size === 'SMALL' ? 2 : 1;
                        }
                    } else {
                        this.gameOver();
                        return;
                    }
                } else if (entity.constructor.name === 'Shield' && this.hero.collidesWith(entity)) {
                    this.hero.addShield();
                    this.shield = null;
                } else if (entity.constructor.name === 'WeaponPickup' && this.hero.collidesWith(entity)) {
                    this.hero.upgradeWeapon(entity.weaponLevel);
                    this.weaponPickup = null;
                    this.nextWeaponLevel++;
                    this.lastWeaponSpawn = performance.now();
                }
            }
        }
    }

    gameOver() {
        if (this.gameState !== 'playing' || this.gameState === 'exploding') return;
        
        // Hide HUD
        if (this.hudContainer) {
            this.hudContainer.style.display = 'none';
        }

        this.gameState = 'exploding';
        this.explosionParticles = [];

        // Create hero explosion (yellow particles for the player ship)
        this.createExplosion(this.hero.x, this.hero.y, '#FFD700', 60);

        // Create explosions for all active asteroids immediately
        this.asteroids
            .filter(asteroid => asteroid.active)
            .forEach(asteroid => {
                this.createExplosion(asteroid.x, asteroid.y, asteroid.color, 40);
            });

        // Immediately clear all game objects
        this.asteroids = []; // Clear all asteroids
        this.bullets = [];
        this.shield = null;
        this.weaponPickup = null;
        this.hero.active = false;
        
        // Store final time
        this.finalTime = Math.floor((this.currentTime - this.startTime) / 1000);
    }

    createExplosion(x, y, color = '#FFA500', count = 30) {
        if (!this.explosionParticles) {
            this.explosionParticles = [];
        }

        for (let i = 0; i < count; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(100, 300); // Increased speed range for more dramatic effect
            const size = random(2, 5);  // Slightly larger particles
            const life = random(0.8, 2.0); // Longer particle life

            this.explosionParticles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color,
                life
            });
        }
    }

    handleBulletAsteroidCollision(bullet, asteroid) {
        bullet.active = false;
        
        // Create explosion for the original asteroid
        this.createExplosion(asteroid.x, asteroid.y, asteroid.color, 20);
        
        // Split the asteroid if it's not small
        const newAsteroids = asteroid.split();
        if (newAsteroids.length > 0) {
            // Add new asteroids to the game
            this.asteroids.push(...newAsteroids);
            
            // Create smaller explosions for each new asteroid
            newAsteroids.forEach(newAsteroid => {
                this.createExplosion(newAsteroid.x, newAsteroid.y, newAsteroid.color, 10);
            });
            
            // Score based on size
            this.score += asteroid.size === 'LARGE' ? 15 : 10;
        } else {
            // Small asteroid destroyed
            this.score += 5;
        }
        
        // Deactivate the original asteroid
        asteroid.active = false;
    }

    showGameOverScreen() {
        this.gameState = 'gameover';
        
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const container = document.createElement('div');
        container.className = 'welcome-container';

        const title = document.createElement('h1');
        title.className = 'title';
        title.textContent = 'Mission Failed';

        const subtitle = document.createElement('div');
        subtitle.className = 'subtitle';
        subtitle.textContent = 'Your ship was destroyed, but your legacy lives on';

        // Get the current high score from local storage
        const currentHighScore = parseInt(localStorage.getItem('asteroids_highscore')) || 0;
        const isNewHighScore = this.score > currentHighScore;

        // Update high score if beaten
        if (isNewHighScore) {
            localStorage.setItem('asteroids_highscore', this.score);
        }

        const stats = document.createElement('div');
        stats.className = 'controls single-column';
        stats.innerHTML = `
            <p>Final Score: <span>${this.score}</span></p>
            <p>Survival Time: <span>${this.finalTime} seconds</span></p>
            ${isNewHighScore 
                ? `<p style="color: #FFA500;">New High Score!</p>`
                : `<p>High Score: <span>${currentHighScore}</span></p>`
            }
        `;

        const restartButton = document.createElement('button');
        restartButton.className = 'button';
        restartButton.textContent = 'Launch New Mission';
        restartButton.onclick = () => {
            overlay.remove();
            this.startGame();
        };

        container.appendChild(title);
        container.appendChild(subtitle);
        container.appendChild(stats);
        container.appendChild(restartButton);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.background.draw(this.ctx);

        // Save context for game world drawing
        this.ctx.save();

        // Draw game objects
        if (this.gameState === 'playing' || this.gameState === 'exploding') {
            // Draw shield pickup
            if (this.shield) {
                this.shield.draw(this.ctx);
            }

            // Draw weapon pickup
            if (this.weaponPickup) {
                this.weaponPickup.draw(this.ctx);
            }

            // Draw asteroids
            for (const asteroid of this.asteroids) {
                asteroid.draw(this.ctx);
            }

            // Draw bullets
            for (const bullet of this.bullets) {
                bullet.draw(this.ctx);
            }

            // Draw hero
            if (this.hero.active) {
                this.hero.draw(this.ctx);
            }

            // Draw explosion particles
            if (this.explosionParticles) {
                for (const particle of this.explosionParticles) {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = particle.color;
                    this.ctx.globalAlpha = particle.life;
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1;
                }
            }
        }

        // Restore context
        this.ctx.restore();

        // Update HUD
        this.drawHUD();
    }

    drawHUD() {
        // Only update HUD if game is playing
        if (this.gameState === 'playing') {
            // Update time display
            const timeElement = document.getElementById('timeValue');
            if (timeElement) {
                timeElement.textContent = formatTime(this.currentTime - this.startTime);
            }

            // Update score display
            const scoreElement = document.getElementById('scoreValue');
            if (scoreElement) {
                scoreElement.textContent = this.score.toString();
            }
        }
    }

    gameLoop(timestamp) {
        // Request next frame first
        requestAnimationFrame(this.gameLoop);

        // Calculate and update FPS
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }

        // Calculate frame time and clamp it to prevent spiral of death
        let frameTime = (timestamp - this.lastFrameTime) / 1000;
        frameTime = Math.min(frameTime, 0.25); // Cap at 250ms
        this.lastFrameTime = timestamp;
        this.currentTime = timestamp;

        if (this.isPaused) return;

        // Accumulate time and update with fixed time step
        this.accumulator += frameTime;
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }

        // Draw at whatever frame rate we can achieve
        this.draw();
    }

    // Add entity to collision grid
    addToCollisionGrid(entity) {
        const cellX = Math.floor(entity.x / this.gridCellSize);
        const cellY = Math.floor(entity.y / this.gridCellSize);
        const key = `${cellX},${cellY}`;
        
        if (!this.collisionGrid.has(key)) {
            this.collisionGrid.set(key, new Set());
        }
        this.collisionGrid.get(key).add(entity);
        
        // Also add to neighboring cells if entity spans multiple cells
        const radius = entity.radius || 0;
        const minCellX = Math.floor((entity.x - radius) / this.gridCellSize);
        const maxCellX = Math.floor((entity.x + radius) / this.gridCellSize);
        const minCellY = Math.floor((entity.y - radius) / this.gridCellSize);
        const maxCellY = Math.floor((entity.y + radius) / this.gridCellSize);
        
        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                const neighborKey = `${x},${y}`;
                if (neighborKey !== key) {
                    if (!this.collisionGrid.has(neighborKey)) {
                        this.collisionGrid.set(neighborKey, new Set());
                    }
                    this.collisionGrid.get(neighborKey).add(entity);
                }
            }
        }
    }

    // Remove entity from collision grid
    removeFromCollisionGrid(entity) {
        const radius = entity.radius || 0;
        const minCellX = Math.floor((entity.x - radius) / this.gridCellSize);
        const maxCellX = Math.floor((entity.x + radius) / this.gridCellSize);
        const minCellY = Math.floor((entity.y - radius) / this.gridCellSize);
        const maxCellY = Math.floor((entity.y + radius) / this.gridCellSize);
        
        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                const key = `${x},${y}`;
                if (this.collisionGrid.has(key)) {
                    this.collisionGrid.get(key).delete(entity);
                }
            }
        }
    }

    // Get potential collision candidates for an entity
    getCollisionCandidates(entity) {
        const candidates = new Set();
        const radius = entity.radius || 0;
        const minCellX = Math.floor((entity.x - radius) / this.gridCellSize);
        const maxCellX = Math.floor((entity.x + radius) / this.gridCellSize);
        const minCellY = Math.floor((entity.y - radius) / this.gridCellSize);
        const maxCellY = Math.floor((entity.y + radius) / this.gridCellSize);
        
        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                const key = `${x},${y}`;
                if (this.collisionGrid.has(key)) {
                    for (const candidate of this.collisionGrid.get(key)) {
                        if (candidate !== entity) {
                            candidates.add(candidate);
                        }
                    }
                }
            }
        }
        
        return candidates;
    }
}
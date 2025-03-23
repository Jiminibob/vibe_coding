class PlayState extends GameState {
    constructor(game) {
        super(game);
        this.bases = [];
        this.launchers = [];
        this.missiles = [];
        this.asteroids = [];
        this.explosions = [];
        this.scorePopups = [];
        this.targetMarkers = [];
        this.asteroidSpawnTimer = 0;
        this.currentAsteroidSpeed = CONSTANTS.ASTEROID.INITIAL_SPEED;
        this.currentSpawnRate = CONSTANTS.ASTEROID.INITIAL_SPAWN_RATE;
        this.gameTimeMinutes = 0;
    }

    enter() {
        // Create bases and launchers
        const totalWidth = this.game.canvas.width;
        const centerX = totalWidth / 2;
        
        // Calculate total width needed
        const totalElements = 9; // 3 launchers + 6 bases
        const totalBaseWidth = 6 * CONSTANTS.BASE.WIDTH; // 6 bases
        const totalLauncherWidth = 3 * CONSTANTS.LAUNCHER.WIDTH; // 3 launchers
        const minSpacing = 20; // Minimum space between elements
        const totalSpacing = minSpacing * (totalElements - 1); // Space between elements
        const groupWidth = totalBaseWidth + totalLauncherWidth + totalSpacing;
        
        // Calculate start position to center everything
        const startX = centerX - (groupWidth / 2);
        
        // Position elements
        let currentX = startX;
        for (let i = 0; i < 9; i++) {
            if (i % 4 === 0) {
                // Add launcher
                this.launchers.push(new Launcher(currentX + CONSTANTS.LAUNCHER.WIDTH/2, CONSTANTS.GROUND_LEVEL));
                currentX += CONSTANTS.LAUNCHER.WIDTH + minSpacing;
            } else {
                // Add base
                this.bases.push(new Base(currentX + CONSTANTS.BASE.WIDTH/2, CONSTANTS.GROUND_LEVEL));
                currentX += CONSTANTS.BASE.WIDTH + minSpacing;
            }
        }

        // Start the game
        this.game.start();
    }

    update(deltaTime) {
        // Update game difficulty every minute
        const newMinutes = Math.floor((this.game.currentTime - this.game.startTime) / 60000);
        if (newMinutes > this.gameTimeMinutes) {
            this.gameTimeMinutes = newMinutes;
            this.increaseDifficulty();
        }

        // Update launchers
        this.launchers.forEach(launcher => launcher.update(deltaTime));

        // Spawn asteroids
        this.asteroidSpawnTimer += deltaTime * 1000;
        if (this.asteroidSpawnTimer >= this.currentSpawnRate) {
            this.spawnAsteroid();
            this.asteroidSpawnTimer = 0;
        }

        // Update missiles
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            if (this.missiles[i].update(deltaTime)) {
                const pos = this.missiles[i].getPosition();
                this.explosions.push(new Explosion(pos.x, pos.y));
                this.missiles.splice(i, 1);
            }
        }

        // Update asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            if (this.asteroids[i].update(deltaTime)) {
                // Create explosion when asteroid hits the ground
                if (this.asteroids[i].y + this.asteroids[i].radius >= CONSTANTS.GROUND_LEVEL) {
                    const pos = { x: this.asteroids[i].x, y: CONSTANTS.GROUND_LEVEL };
                    this.explosions.push(new Explosion(pos.x, pos.y, CONSTANTS.COLORS.DANGER));
                }
                this.asteroids.splice(i, 1);
                continue;
            }

            // Check collision with bases
            for (const base of this.bases) {
                if (this.asteroids[i].checkCollision(base)) {
                    if (base.takeDamage(1)) {
                        // Base destroyed
                        this.bases = this.bases.filter(b => b !== base);
                    }
                    const pos = { x: this.asteroids[i].x, y: this.asteroids[i].y };
                    this.explosions.push(new Explosion(pos.x, pos.y, CONSTANTS.COLORS.DANGER));
                    this.asteroids[i].destroy();
                    break;
                }
            }

            // Check collision with launchers
            if (!this.asteroids[i].destroyed) {
                for (let j = this.launchers.length - 1; j >= 0; j--) {
                    if (this.asteroids[i].checkCollision(this.launchers[j])) {
                        // Destroy both launcher and asteroid
                        this.launchers[j].destroy();
                        const pos = { x: this.asteroids[i].x, y: this.asteroids[i].y };
                        this.explosions.push(new Explosion(pos.x, pos.y, CONSTANTS.COLORS.DANGER));
                        this.asteroids[i].destroy();
                        break;
                    }
                }
            }

            // Remove destroyed asteroids
            if (this.asteroids[i].destroyed) {
                this.asteroids.splice(i, 1);
            }
        }

        // Update explosions and check for asteroid destruction
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            if (this.explosions[i].update(deltaTime)) {
                const points = this.explosions[i].getPoints();
                const multiplier = this.explosions[i].getMultiplier();
                
                if (points > 0) {
                    this.game.updateScore(points);
                    this.scorePopups.push(
                        new ScorePopup(
                            this.explosions[i].x,
                            this.explosions[i].y,
                            points,
                            multiplier
                        )
                    );
                }
                
                this.explosions.splice(i, 1);
                continue;
            }

            // Check for asteroid destruction by explosions
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.explosions[i].checkCollision(this.asteroids[j])) {
                    // Don't create a new explosion for missile hits
                    // Only create explosion if asteroid hits base or launcher
                    this.asteroids[j].destroy();
                    this.asteroids.splice(j, 1);
                }
            }
        }

        // Update score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            if (this.scorePopups[i].update(deltaTime)) {
                this.scorePopups.splice(i, 1);
            }
        }

        // Check for game over
        if (this.bases.length === 0) {
            this.game.setState('gameOver');
        }
    }

    render(ctx) {
        // Draw target markers
        this.targetMarkers.forEach(marker => {
            const color = marker.valid ? CONSTANTS.COLORS.SUCCESS : CONSTANTS.COLORS.DANGER;
            
            // Draw cross shape
            ctx.beginPath();
            // Horizontal line
            ctx.moveTo(marker.x - CONSTANTS.MARKER.LENGTH, marker.y);
            ctx.lineTo(marker.x + CONSTANTS.MARKER.LENGTH, marker.y);
            // Vertical line
            ctx.moveTo(marker.x, marker.y - CONSTANTS.MARKER.LENGTH);
            ctx.lineTo(marker.x, marker.y + CONSTANTS.MARKER.LENGTH);
            
            ctx.strokeStyle = color;
            ctx.lineWidth = CONSTANTS.MARKER.SIZE;
            ctx.lineCap = 'round';
            
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Draw game entities
        this.bases.forEach(base => base.render(ctx));
        this.launchers.forEach(launcher => launcher.render(ctx));
        this.missiles.forEach(missile => missile.render(ctx));
        this.asteroids.forEach(asteroid => asteroid.render(ctx));
        this.explosions.forEach(explosion => explosion.render(ctx));
        this.scorePopups.forEach(popup => popup.render(ctx));

        // Draw ground last so it appears on top
        ctx.fillStyle = CONSTANTS.COLORS.EXPLOSION;  // White
        ctx.fillRect(0, CONSTANTS.GROUND_LEVEL, this.game.canvas.width, 2);

        // Add ground glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONSTANTS.COLORS.EXPLOSION;  // White
        ctx.fillRect(0, CONSTANTS.GROUND_LEVEL, this.game.canvas.width, 2);
        ctx.shadowBlur = 0;
    }

    handleClick(x, y) {
        // Don't process clicks below ground level
        if (y >= CONSTANTS.GROUND_LEVEL) return;

        // Find closest available launcher
        let closestLauncher = null;
        let closestDistance = Infinity;

        for (const launcher of this.launchers) {
            if (!launcher.canLaunch() || launcher.destroyed) continue;

            const dx = x - launcher.x;
            const dy = y - launcher.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestLauncher = launcher;
            }
        }

        // Add target marker
        const marker = { x, y, valid: closestLauncher !== null };
        this.targetMarkers.push(marker);

        // Launch missile if launcher found
        if (closestLauncher) {
            const missile = closestLauncher.launch(x, y);
            if (missile) {
                this.missiles.push(missile);
            }
        }

        // Remove marker after delay
        setTimeout(() => {
            const index = this.targetMarkers.indexOf(marker);
            if (index !== -1) {
                this.targetMarkers.splice(index, 1);
            }
        }, 500);
    }

    spawnAsteroid() {
        const x = Math.random() * this.game.canvas.width;
        this.asteroids.push(new Asteroid(x, this.currentAsteroidSpeed, this.launchers, this.bases));
    }

    increaseDifficulty() {
        // Increase asteroid speed
        this.currentAsteroidSpeed = Math.min(
            CONSTANTS.ASTEROID.MAX_SPEED,
            this.currentAsteroidSpeed + CONSTANTS.ASTEROID.SPEED_INCREMENT
        );

        // Decrease spawn rate
        this.currentSpawnRate = Math.max(
            CONSTANTS.ASTEROID.MIN_SPAWN_RATE,
            this.currentSpawnRate - CONSTANTS.ASTEROID.SPAWN_RATE_DECREASE
        );
    }
} 
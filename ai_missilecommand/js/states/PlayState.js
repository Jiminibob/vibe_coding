class PlayState extends GameState {
    constructor(game) {
        super(game);
        this.bases = [];
        this.launchers = [];
        this.missiles = [];
        this.asteroids = [];
        this.explosions = [];
        this.scorePopups = [];
        this.textPopups = [];
        this.targetMarkers = [];
        this.deResEffects = [];
        this.pickups = [];
        this.destroyedLauncherPositions = []; // Track positions of destroyed launchers
        this.asteroidSpawnTimer = 0;
        this.pickupSpawnTimer = 0;
        this.currentAsteroidSpeed = CONSTANTS.ASTEROID.INITIAL_SPEED;
        this.currentSpawnRate = CONSTANTS.ASTEROID.INITIAL_SPAWN_RATE;
        this.difficultyLevel = 0;
        this.gameOverSequenceStarted = false;
        this.gameOverTimer = 0;
        this.destroyAllAsteroids = false; // Flag for asteroid destroyer pickup
        this.repairLauncher = false; // Flag for launcher repair pickup
        this.timeFreeze = false; // Flag for time freeze pickup
        this.timeFreezeTimer = 0; // Timer for time freeze duration
        this.recentPickupTypes = []; // Track recent pickup types to avoid repetition
    }

    enter() {
        // Show UI overlay
        document.getElementById('ui-overlay').classList.add('active');

        // Reset trajectory visibility
        CONSTANTS.TRAJECTORY.VISIBLE = false;

        // Reset launcher cooldown to default
        CONSTANTS.LAUNCHER.COOLDOWN = 1000;
        
        // Reset explosion radius to default
        CONSTANTS.EXPLOSION.MAX_RADIUS = 50;
        
        // Reset pickup flags
        this.destroyAllAsteroids = false;
        this.repairLauncher = false;
        this.timeFreeze = false;
        this.timeFreezeTimer = 0;
        this.recentPickupTypes = []; // Reset the recent pickup types tracker
        
        // Clear destroyed launcher positions
        this.destroyedLauncherPositions = [];

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

        // Start the gameplay timer and score
        this.game.startGameplay();
    }

    exit() {
        // Hide UI overlay
        document.getElementById('ui-overlay').classList.remove('active');
    }

    update(deltaTime) {
        // Update game difficulty every 15 seconds (was every minute)
        const newDifficultyLevel = Math.floor((this.game.currentTime - this.game.startTime) / 15000);
        if (newDifficultyLevel > this.difficultyLevel) {
            this.difficultyLevel = newDifficultyLevel;
            this.increaseDifficulty();
        }

        // Handle time freeze effect
        if (this.timeFreeze) {
            this.timeFreezeTimer += deltaTime;
            if (this.timeFreezeTimer >= 3) { // 3 second duration
                this.timeFreeze = false;
                this.timeFreezeTimer = 0;
            }
        }

        // Handle asteroid destroyer pickup if active
        if (this.destroyAllAsteroids) {
            this.destroyAllAsteroids = false; // Reset flag
            
            // Create a collection to track destroyed asteroids and their positions
            const destroyedPositions = [];
            const asteroidCount = this.asteroids.length;
            
            // Destroy all active asteroids
            for (let i = this.asteroids.length - 1; i >= 0; i--) {
                if (!this.asteroids[i].destroyed) {
                    // Save position before destroying
                    destroyedPositions.push({
                        x: this.asteroids[i].x,
                        y: this.asteroids[i].y
                    });
                    
                    // Destroy the asteroid
                    this.asteroids[i].destroy();
                }
            }
            
            // Create a single explosion in the middle of the screen for points
            if (destroyedPositions.length > 0) {
                // Create explosion in center of screen
                const centerX = this.game.canvas.width / 2;
                const centerY = this.game.canvas.height / 2;
                
                const explosion = new Explosion(centerX, centerY);
                
                // Set the destroyed asteroids count for scoring
                explosion.destroyedAsteroids = destroyedPositions.length;
                
                // Add to explosions array
                this.explosions.push(explosion);
                
                // Visual effect - add explosion at each asteroid position
                destroyedPositions.forEach(pos => {
                    // Create visual explosion at each asteroid position (no scoring)
                    const visualExplosion = new Explosion(pos.x, pos.y);
                    visualExplosion.destroyedAsteroids = -1; // No points from these explosions
                    this.explosions.push(visualExplosion);
                });
            }
        }
        
        // Handle launcher repair pickup if active
        if (this.repairLauncher && this.destroyedLauncherPositions.length > 0) {
            this.repairLauncher = false; // Reset flag
            
            // Get the position of the first destroyed launcher
            const position = this.destroyedLauncherPositions.shift();
            
            // Create a new launcher at that position
            const newLauncher = new Launcher(position.x, position.y);
            this.launchers.push(newLauncher);
            
            // Add reverse de-res effect (appearing effect)
            this.deResEffects.push(new DeResParticles(
                position.x - CONSTANTS.LAUNCHER.WIDTH/2,
                position.y - CONSTANTS.LAUNCHER.HEIGHT/2,
                CONSTANTS.LAUNCHER.WIDTH,
                CONSTANTS.LAUNCHER.HEIGHT,
                CONSTANTS.COLORS.PRIMARY,
                true, // full height
                { min: 100, max: 200 }, // Speed range
                true // Reverse direction (appearing instead of disappearing)
            ));
        }

        // Update launchers
        this.launchers.forEach(launcher => launcher.update(deltaTime));

        // Spawn asteroids (only if game isn't ending)
        if (!this.gameOverSequenceStarted) {
            this.asteroidSpawnTimer += deltaTime * 1000;
            if (this.asteroidSpawnTimer >= this.currentSpawnRate) {
                this.spawnAsteroid();
                this.asteroidSpawnTimer = 0;
            }
        }

        // Spawn pickups (only if game isn't ending)
        if (!this.gameOverSequenceStarted) {
            this.pickupSpawnTimer += deltaTime;
            if (this.pickupSpawnTimer >= 7.5) { // Spawn pickup every 7.5 seconds (reduced from 15)
                this.spawnPickup();
                this.pickupSpawnTimer = 0;
            }
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
            // Skip position update if time freeze is active, but still process collisions
            if (this.timeFreeze && !this.asteroids[i].destroyed) {
                // For frozen asteroids, only update explosion particles if destroyed
                if (this.asteroids[i].destroyed && this.asteroids[i].update(deltaTime)) {
                    this.asteroids.splice(i, 1);
                }
                continue;
            }
            
            if (this.asteroids[i].update(deltaTime)) {
                // If update returns true, either:
                // 1. Asteroid is out of bounds
                // 2. Asteroid is destroyed and its particles are done
                // 3. Asteroid hit the ground
                
                // Create explosion when asteroid hits the ground
                if (!this.asteroids[i].destroyed && this.asteroids[i].y + this.asteroids[i].radius >= CONSTANTS.GROUND_LEVEL) {
                    const pos = { x: this.asteroids[i].x, y: CONSTANTS.GROUND_LEVEL };
                    
                    // Add ground impact DeRes particles with custom speed range for shorter rise
                    this.deResEffects.push(new DeResParticles(
                        pos.x - 40, // Center on impact point
                        CONSTANTS.GROUND_LEVEL - 2, // Just above ground line
                        80, // Width of impact area
                        4,  // Height of ground line
                        CONSTANTS.COLORS.EXPLOSION, // White color for ground
                        true, // Full destruction effect (for particle density)
                        { min: 80, max: 120 } // Custom speed range for ~100px rise
                    ));
                    
                    // Create visual-only explosion that doesn't count for points
                    const explosion = new Explosion(pos.x, pos.y, CONSTANTS.COLORS.DANGER);
                    explosion.destroyedAsteroids = -1; // Prevent points from being awarded
                    this.explosions.push(explosion);
                }
                this.asteroids.splice(i, 1);
                continue;
            }

            // Skip collision checks if asteroid is already destroyed
            if (this.asteroids[i].destroyed) continue;

            // Check collision with bases
            for (const base of this.bases) {
                if (this.asteroids[i].checkCollision(base)) {
                    if (base.takeDamage(1)) {
                        // Base destroyed - add de-res effect with full height
                        this.deResEffects.push(new DeResParticles(
                            base.x - base.width/2,
                            base.y - base.height/2,
                            base.width,
                            base.height,
                            CONSTANTS.COLORS.BASE,
                            true // full height for destruction
                        ));
                        // Remove base
                        this.bases = this.bases.filter(b => b !== base);
                    } else {
                        // Base damaged but not destroyed - add smaller de-res effect
                        this.deResEffects.push(new DeResParticles(
                            base.x - base.width/2,
                            base.y - base.height/2,
                            base.width,
                            base.height,
                            CONSTANTS.COLORS.BASE,
                            false // reduced height for damage
                        ));
                    }
                    const pos = { x: this.asteroids[i].x, y: this.asteroids[i].y };
                    // Create visual-only explosion that doesn't count for points
                    const explosion = new Explosion(pos.x, pos.y, CONSTANTS.COLORS.DANGER);
                    explosion.destroyedAsteroids = -1; // Prevent points from being awarded
                    this.explosions.push(explosion);
                    this.asteroids[i].destroy();
                    break;
                }
            }

            // Check collision with launchers
            for (let j = this.launchers.length - 1; j >= 0; j--) {
                if (this.asteroids[i].checkCollision(this.launchers[j])) {
                    // Store the position of the destroyed launcher
                    this.destroyedLauncherPositions.push({
                        x: this.launchers[j].x,
                        y: this.launchers[j].y
                    });
                    
                    // Add de-res effect before destroying launcher
                    this.deResEffects.push(new DeResParticles(
                        this.launchers[j].x - CONSTANTS.LAUNCHER.WIDTH/2,
                        this.launchers[j].y - CONSTANTS.LAUNCHER.HEIGHT/2,
                        CONSTANTS.LAUNCHER.WIDTH,
                        CONSTANTS.LAUNCHER.HEIGHT,
                        CONSTANTS.COLORS.PRIMARY
                    ));
                    // Destroy launcher and remove from array
                    this.launchers[j].destroy();
                    this.launchers.splice(j, 1);
                    
                    const pos = { x: this.asteroids[i].x, y: this.asteroids[i].y };
                    // Create visual-only explosion that doesn't count for points
                    const explosion = new Explosion(pos.x, pos.y, CONSTANTS.COLORS.DANGER);
                    explosion.destroyedAsteroids = -1; // Prevent points from being awarded
                    this.explosions.push(explosion);
                    this.asteroids[i].destroy();
                    break;
                }
            }
        }

        // Update pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            if (this.pickups[i].update(deltaTime)) {
                this.pickups.splice(i, 1);
            }
        }

        // Update explosions and check for asteroid/pickup destruction
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
                // Skip if this asteroid is already destroyed
                if (!this.asteroids[j].destroyed && this.explosions[i].checkCollision(this.asteroids[j])) {
                    this.asteroids[j].destroy();
                }
            }

            // Check for pickup collection
            for (let j = this.pickups.length - 1; j >= 0; j--) {
                if (this.pickups[j].checkCollision(this.explosions[i])) {
                    // Create a visual effect for pickup collection
                    this.deResEffects.push(new DeResParticles(
                        this.pickups[j].x,
                        this.pickups[j].y,
                        20, // Width
                        20, // Height
                        CONSTANTS.COLORS.SUCCESS,
                        true, // Full destruction effect
                        { min: 100, max: 150 } // Medium rise height
                    ));
                    
                    // Get pickup description text based on type
                    let pickupText = "";
                    switch(this.pickups[j].type) {
                        case 'explosion_radius':
                            pickupText = "EXPLOSION RADIUS +10%";
                            break;
                        case 'trajectory':
                            pickupText = "TRAJECTORY LINES ENABLED";
                            break;
                        case 'cooldown_reduction':
                            pickupText = "LAUNCHER COOLDOWN -25%";
                            break;
                        case 'asteroid_destroyer':
                            pickupText = "ALL ASTEROIDS DESTROYED";
                            break;
                        case 'launcher_repair':
                            pickupText = "LAUNCHER REPAIRED";
                            break;
                        case 'time_freeze':
                            pickupText = "TIME FREEZE - 3 SECONDS";
                            break;
                    }
                    
                    // Create text popup
                    if (pickupText) {
                        this.textPopups.push(new TextPopup(
                            this.pickups[j].x,
                            this.pickups[j].y - 25, // Position above the pickup
                            pickupText,
                            this.pickups[j].type === 'time_freeze' ? CONSTANTS.COLORS.FREEZE : CONSTANTS.COLORS.SUCCESS
                        ));
                    }
                    
                    // Apply pickup effect
                    this.pickups[j].collect(this.game);
                    this.pickups.splice(j, 1);
                }
            }
        }

        // Update de-res effects
        for (let i = this.deResEffects.length - 1; i >= 0; i--) {
            if (this.deResEffects[i].update(deltaTime)) {
                this.deResEffects.splice(i, 1);
            }
        }

        // Update score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            if (this.scorePopups[i].update(deltaTime)) {
                this.scorePopups.splice(i, 1);
            }
        }
        
        // Update text popups
        for (let i = this.textPopups.length - 1; i >= 0; i--) {
            if (this.textPopups[i].update(deltaTime)) {
                this.textPopups.splice(i, 1);
            }
        }

        // Check for game over
        if ((this.bases.length === 0 || this.launchers.length === 0) && !this.gameOverSequenceStarted) {
            this.startGameOverSequence();
        }

        // Handle game over sequence
        if (this.gameOverSequenceStarted) {
            this.gameOverTimer += deltaTime;
            
            // Wait for all effects to finish and 2 seconds to pass
            if (this.gameOverTimer >= 2 && 
                this.deResEffects.length === 0 && 
                this.explosions.length === 0) {
                this.game.setState('gameOver');
            }
        }
    }

    render(ctx) {
        // Draw target markers
        this.targetMarkers.forEach(marker => {
            const color = marker.valid ? CONSTANTS.COLORS.PRIMARY : CONSTANTS.COLORS.DANGER;
            const length = marker.valid ? CONSTANTS.MARKER.LENGTH : CONSTANTS.MARKER.LENGTH * 0.7;
            
            // Draw cross shape
            ctx.beginPath();
            // Horizontal line
            ctx.moveTo(marker.x - length, marker.y);
            ctx.lineTo(marker.x + length, marker.y);
            // Vertical line
            ctx.moveTo(marker.x, marker.y - length);
            ctx.lineTo(marker.x, marker.y + length);
            
            ctx.strokeStyle = color;
            // Make invalid markers thinner
            ctx.lineWidth = marker.valid ? CONSTANTS.MARKER.SIZE : CONSTANTS.MARKER.SIZE / 2;
            ctx.lineCap = 'round';
            
            // Add glow effect
            ctx.shadowBlur = marker.valid ? 10 : 6;
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
        this.deResEffects.forEach(effect => effect.render(ctx));
        this.pickups.forEach(pickup => pickup.render(ctx));
        this.scorePopups.forEach(popup => popup.render(ctx));
        this.textPopups.forEach(popup => popup.render(ctx));

        // Draw ground last so it appears on top
        ctx.fillStyle = CONSTANTS.COLORS.EXPLOSION;  // White
        ctx.fillRect(0, CONSTANTS.GROUND_LEVEL, this.game.canvas.width, 2);

        // Add ground glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONSTANTS.COLORS.EXPLOSION;  // White
        ctx.fillRect(0, CONSTANTS.GROUND_LEVEL, this.game.canvas.width, 2);
        ctx.shadowBlur = 0;
        
        // Draw time freeze effect if active
        if (this.timeFreeze) {
            // Draw border glow effect
            ctx.strokeStyle = CONSTANTS.COLORS.FREEZE;
            ctx.lineWidth = 10;
            ctx.shadowBlur = 20;
            ctx.shadowColor = CONSTANTS.COLORS.FREEZE;
            
            ctx.beginPath();
            ctx.rect(0, 0, this.game.canvas.width, this.game.canvas.height);
            ctx.stroke();
            
            // Draw flakes around frozen asteroids
            this.asteroids.forEach(asteroid => {
                if (!asteroid.destroyed) {
                    // Draw 3 little snowflakes around each asteroid
                    for (let i = 0; i < 3; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = asteroid.radius * 1.5 + Math.random() * asteroid.radius;
                        const x = asteroid.x + Math.cos(angle) * distance;
                        const y = asteroid.y + Math.sin(angle) * distance;
                        
                        // Draw small snowflake
                        ctx.beginPath();
                        for (let j = 0; j < 3; j++) {
                            const flakeAngle = (j / 3) * Math.PI * 2;
                            const lineLength = 3 + Math.random() * 2;
                            
                            ctx.moveTo(x, y);
                            ctx.lineTo(
                                x + Math.cos(flakeAngle) * lineLength,
                                y + Math.sin(flakeAngle) * lineLength
                            );
                            
                            ctx.moveTo(x, y);
                            ctx.lineTo(
                                x + Math.cos(flakeAngle + Math.PI/2) * lineLength,
                                y + Math.sin(flakeAngle + Math.PI/2) * lineLength
                            );
                        }
                        
                        ctx.strokeStyle = CONSTANTS.COLORS.FREEZE;
                        ctx.lineWidth = 1;
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = CONSTANTS.COLORS.FREEZE;
                        ctx.stroke();
                    }
                }
            });
            
            ctx.shadowBlur = 0;
        }
    }

    handleClick(x, y) {
        // Don't process clicks below ground level
        if (y >= CONSTANTS.GROUND_LEVEL) return;

        // Find closest available launcher
        let closestLauncher = null;
        let closestDistance = Infinity;

        for (const launcher of this.launchers) {
            if (!launcher.canLaunch()) continue;

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

    spawnPickup() {
        const fromLeft = Math.random() < 0.5;
        const x = fromLeft ? -10 : CONSTANTS.MAX_GAME_WIDTH + 10;
        const y = CONSTANTS.GROUND_LEVEL * 0.3 + Math.random() * CONSTANTS.GROUND_LEVEL * 0.4;
        const direction = fromLeft ? 1 : -1;
        
        // Available pickup types
        const pickupTypes = [
            'explosion_radius',
            'cooldown_reduction',
            'asteroid_destroyer',
            'time_freeze'
        ];
        
        // Add trajectory if not already active
        if (!CONSTANTS.TRAJECTORY.VISIBLE) {
            pickupTypes.push('trajectory');
        }
        
        // Add launcher_repair if there are destroyed launchers
        if (this.destroyedLauncherPositions.length > 0) {
            pickupTypes.push('launcher_repair');
        }
        
        // Filter out recently seen pickup types
        const availableTypes = pickupTypes.filter(type => !this.recentPickupTypes.includes(type));
        
        // If no valid types remain (unlikely but possible), allow all types
        const pickupPool = availableTypes.length > 0 ? availableTypes : pickupTypes;
        
        // Select a random pickup type from the available pool
        const pickupType = pickupPool[Math.floor(Math.random() * pickupPool.length)];
        
        // Update recent pickup types list (keep at most 2 recent types)
        this.recentPickupTypes.push(pickupType);
        if (this.recentPickupTypes.length > 2) {
            this.recentPickupTypes.shift(); // Remove oldest type
        }
        
        this.pickups.push(new Pickup(x, y, direction, 100, pickupType));
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

    startGameOverSequence() {
        this.gameOverSequenceStarted = true;
        
        // Destroy all remaining bases with DeRes effect
        this.bases.forEach(base => {
            this.deResEffects.push(new DeResParticles(
                base.x - base.width/2,
                base.y - base.height/2,
                base.width,
                base.height,
                CONSTANTS.COLORS.BASE,
                true // full height for destruction
            ));
        });
        this.bases = [];

        // Destroy all remaining launchers with DeRes effect
        this.launchers.forEach(launcher => {
            this.deResEffects.push(new DeResParticles(
                launcher.x - CONSTANTS.LAUNCHER.WIDTH/2,
                launcher.y - CONSTANTS.LAUNCHER.HEIGHT/2,
                CONSTANTS.LAUNCHER.WIDTH,
                CONSTANTS.LAUNCHER.HEIGHT,
                CONSTANTS.COLORS.PRIMARY,
                true // full height for destruction
            ));
            launcher.destroy();
        });
        this.launchers = [];

        // Destroy all remaining asteroids with explosion particles
        this.asteroids.forEach(asteroid => {
            if (!asteroid.destroyed) {
                asteroid.destroy();
            }
        });

        // Clear any remaining missiles
        this.missiles = [];
        this.targetMarkers = [];

        // Clear any active pickups
        this.pickups = [];

        // Reset timers
        this.asteroidSpawnTimer = 0;
        this.pickupSpawnTimer = 0;
        this.difficultyLevel = 0;
        this.gameOverTimer = 0;
        
        // Reset asteroid speed and spawn rate to initial values
        this.currentAsteroidSpeed = CONSTANTS.ASTEROID.INITIAL_SPEED;
        this.currentSpawnRate = CONSTANTS.ASTEROID.INITIAL_SPAWN_RATE;
    }
} 
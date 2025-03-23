class DeResParticles {
    constructor(x, y, width, height, color, isDestroyed = true, customSpeedRange = null, reverse = false) {
        this.particles = [];
        this.color = color; // Store the color
        this.reverse = reverse; // Store whether particles go up (false) or down (true)
        const particleSize = 4; // Size of each square particle
        
        // Different speed ranges for destruction vs damage
        const speedRange = customSpeedRange || (isDestroyed ? 
            { min: 150, max: 250 } : // Full height for destruction
            { min: 50, max: 100 });  // Lower height for damage
            
        // Denser grid for destruction, sparse for damage
        const gridSpacing = isDestroyed ? particleSize * 1.2 : particleSize * 2;
        
        // Create a grid of particles covering the object
        for (let px = 0; px < width; px += gridSpacing) {
            for (let py = 0; py < height; py += gridSpacing) {
                // Add random offset to starting position
                const offsetX = (Math.random() - 0.5) * particleSize;
                const offsetY = (Math.random() - 0.5) * particleSize;
                
                // Adjust Y position based on direction (for repair effect)
                const startY = this.reverse ? 
                    y + py - height * 2 + offsetY : // Start above for downward movement
                    y + py + offsetY;               // Normal position for upward movement
                
                // For destruction, add some extra random particles
                if (isDestroyed && Math.random() < 0.3) {
                    // Add an extra particle with more random position
                    const extraOffsetX = (Math.random() - 0.5) * particleSize * 2;
                    const extraOffsetY = (Math.random() - 0.5) * particleSize * 2;
                    const extraStartY = this.reverse ?
                        y + py - height * 2 + extraOffsetY : // Start above for downward movement
                        y + py + extraOffsetY;              // Normal position for upward movement
                    
                    this.particles.push({
                        x: x + px + extraOffsetX,
                        y: extraStartY,
                        size: particleSize * (Math.random() * 0.5 + 0.75), // Varied size
                        speed: Math.random() * (speedRange.max - speedRange.min) + speedRange.min,
                        alpha: 1,
                        delay: Math.random() * 0.5
                    });
                }
                
                // Regular grid particle
                this.particles.push({
                    x: x + px + offsetX,
                    y: startY,
                    size: particleSize,
                    speed: Math.random() * (speedRange.max - speedRange.min) + speedRange.min,
                    alpha: 1,
                    delay: Math.random() * 0.5 // Random delay before starting to move
                });
            }
        }
    }

    update(deltaTime) {
        // Update each particle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Handle delay
            if (particle.delay > 0) {
                particle.delay -= deltaTime;
                continue;
            }
            
            // Move particles (upward for destruction, downward for repair)
            if (this.reverse) {
                particle.y += particle.speed * deltaTime; // Move downward
                
                // For repair, fade in as they reach destination
                const alphaRate = this.reverse ? 1.5 : 0.5; // Faster fade-in for repair
                particle.alpha -= deltaTime * alphaRate;
            } else {
                particle.y -= particle.speed * deltaTime; // Move upward
                
                // For destruction, fade out as they rise
                particle.alpha -= deltaTime * 0.5; // Reduced fade rate (was 0.8)
            }
            
            // Remove faded particles
            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Return true when all particles are gone
        return this.particles.length === 0;
    }

    render(ctx) {
        for (const particle of this.particles) {
            if (particle.delay > 0) continue; // Don't render particles still in delay
            
            ctx.save();
            
            // Draw square outline particle
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = this.reverse ? 
                1 - particle.alpha : // For repair, start transparent and become opaque
                particle.alpha;      // For destruction, start opaque and fade out
            
            // Add glow effect
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            
            // Draw the square outline
            ctx.strokeRect(
                particle.x - particle.size/2,
                particle.y - particle.size/2,
                particle.size,
                particle.size
            );
            
            ctx.restore();
        }
    }
} 
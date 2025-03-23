class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.gridSize = 20;  // Size of each grid cell
        this.pulsingCells = [];  // Array to store active pulsing cells
        this.timeSinceLastPulse = 0;
        this.pulseInterval = 0.1;  // New pulse every 0.25 seconds
        this.verticalLines = [];
        this.horizontalLines = [];
        this.timeSinceLastLine = 0;
        this.lineInterval = 0.1;  // New line every 0.5 seconds
        this.lineSpeed = 200;     // Pixels per second
        
        // Initialize grid lines
        this.initializeGridLines();
    }

    initializeGridLines() {
        // Clear existing lines
        this.verticalLines = [];
        this.horizontalLines = [];
        
        // Calculate number of lines needed
        const numCols = Math.ceil(this.canvas.width / this.gridSize);
        const numRows = Math.ceil(this.canvas.height / this.gridSize);
        
        // Initialize vertical lines (all inactive)
        for (let i = 0; i < numCols; i++) {
            this.verticalLines.push({
                x: i * this.gridSize,
                head: 0,
                tail: 0,
                active: false,
                growing: false,
                fromTop: true
            });
        }
        
        // Initialize horizontal lines (all inactive)
        for (let i = 0; i < numRows; i++) {
            this.horizontalLines.push({
                y: i * this.gridSize,
                head: 0,
                tail: 0,
                active: false,
                growing: false,
                fromLeft: true
            });
        }
    }

    handleResize() {
        this.initializeGridLines();
    }

    update(deltaTime) {
        // Update pulsing cells
        this.timeSinceLastPulse += deltaTime;
        if (this.timeSinceLastPulse >= this.pulseInterval) {
            this.timeSinceLastPulse = 0;
            const gridX = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
            const gridY = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
            this.pulsingCells.push({
                x: gridX * this.gridSize,
                y: gridY * this.gridSize,
                timer: 0,
                duration:  1 + Math.random() * 4
            });
        }

        // Update existing pulses
        for (let i = this.pulsingCells.length - 1; i >= 0; i--) {
            const cell = this.pulsingCells[i];
            cell.timer += deltaTime;
            if (cell.timer >= cell.duration) {
                this.pulsingCells.splice(i, 1);
            }
        }

        // Update line animations
        this.timeSinceLastLine += deltaTime;
        if (this.timeSinceLastLine >= this.lineInterval) {
            this.timeSinceLastLine = 0;
            
            // Try to activate a random vertical line
            const inactiveVertical = this.verticalLines.filter(line => !line.active);
            if (inactiveVertical.length > 0) {
                const line = inactiveVertical[Math.floor(Math.random() * inactiveVertical.length)];
                line.active = true;
                line.growing = true;
                line.fromTop = Math.random() < 0.5;
                if (line.fromTop) {
                    line.head = 0;
                    line.tail = 0;
                } else {
                    line.head = this.canvas.height;
                    line.tail = this.canvas.height;
                }
            }
            
            // Try to activate a random horizontal line
            const inactiveHorizontal = this.horizontalLines.filter(line => !line.active);
            if (inactiveHorizontal.length > 0) {
                const line = inactiveHorizontal[Math.floor(Math.random() * inactiveHorizontal.length)];
                line.active = true;
                line.growing = true;
                line.fromLeft = Math.random() < 0.5;
                if (line.fromLeft) {
                    line.head = 0;
                    line.tail = 0;
                } else {
                    line.head = this.canvas.width;
                    line.tail = this.canvas.width;
                }
            }
        }

        // Update active lines
        const moveAmount = this.lineSpeed * deltaTime;
        
        // Update vertical lines
        this.verticalLines.forEach(line => {
            if (!line.active) return;
            
            if (line.growing) {
                if (line.fromTop) {
                    line.head += moveAmount;
                    if (line.head >= this.canvas.height) {
                        line.growing = false;
                        line.head = this.canvas.height;
                    }
                } else {
                    line.head -= moveAmount;
                    if (line.head <= 0) {
                        line.growing = false;
                        line.head = 0;
                    }
                }
            } else {
                if (line.fromTop) {
                    line.tail += moveAmount;
                    if (line.tail >= this.canvas.height) {
                        line.active = false;
                        line.tail = 0;
                        line.head = 0;
                    }
                } else {
                    line.tail -= moveAmount;
                    if (line.tail <= 0) {
                        line.active = false;
                        line.tail = this.canvas.height;
                        line.head = this.canvas.height;
                    }
                }
            }
        });
        
        // Update horizontal lines
        this.horizontalLines.forEach(line => {
            if (!line.active) return;
            
            if (line.growing) {
                if (line.fromLeft) {
                    line.head += moveAmount;
                    if (line.head >= this.canvas.width) {
                        line.growing = false;
                        line.head = this.canvas.width;
                    }
                } else {
                    line.head -= moveAmount;
                    if (line.head <= 0) {
                        line.growing = false;
                        line.head = 0;
                    }
                }
            } else {
                if (line.fromLeft) {
                    line.tail += moveAmount;
                    if (line.tail >= this.canvas.width) {
                        line.active = false;
                        line.tail = 0;
                        line.head = 0;
                    }
                } else {
                    line.tail -= moveAmount;
                    if (line.tail <= 0) {
                        line.active = false;
                        line.tail = this.canvas.width;
                        line.head = this.canvas.width;
                    }
                }
            }
        });
    }

    render(ctx) {
        // Set darker blue background
        ctx.fillStyle = '#000015';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid with slightly lighter blue
        ctx.strokeStyle = '#000033';
        ctx.lineWidth = 1;

        // Draw vertical lines (only active ones)
        this.verticalLines.forEach(line => {
            if (line.active) {
                ctx.beginPath();
                ctx.moveTo(line.x, line.tail);
                ctx.lineTo(line.x, line.head);
                ctx.stroke();
            }
        });

        // Draw horizontal lines (only active ones)
        this.horizontalLines.forEach(line => {
            if (line.active) {
                ctx.beginPath();
                ctx.moveTo(line.tail, line.y);
                ctx.lineTo(line.head, line.y);
                ctx.stroke();
            }
        });

        // Draw pulsing cells
        for (const cell of this.pulsingCells) {
            const progress = cell.timer / cell.duration;
            const opacity = Math.sin(progress * Math.PI) * 0.25;
            ctx.fillStyle = `rgba(0, 0, 80, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, this.gridSize, this.gridSize);
        }
    }
} 
const CONSTANTS = {
    // Canvas
    CANVAS_HEIGHT: 720,
    MAX_GAME_WIDTH: 960,
    GROUND_LEVEL: 700,

    // Colors (Tron-like neon theme)
    COLORS: {
        PRIMARY: '#0ff',    // Cyan
        SECONDARY: '#0088ff', // Light blue
        BACKGROUND: '#000',  // Black
        DANGER: '#ff0088',  // Pink
        SUCCESS: '#00ff88', // Green
        EXPLOSION: '#fff',  // White
        BASE: '#ffbb00',    // Golden yellow
        FREEZE: '#88ddff',  // Light blue for freeze effect
    },

    // Game entities
    LAUNCHER: {
        COOLDOWN: 1000,     // 1.5 seconds between shots (increased from 1000)
        WIDTH: 50,          // Increased from 15
        HEIGHT: 35,
        RECHARGE_WIDTH: 4,  // Width of recharge bar
    },

    BASE: {
        WIDTH: 80,          // Changed from 100
        HEIGHT: 35,         // Changed to match launcher height
        MAX_HP: 3,
    },

    MISSILE: {
        SPEED: 500,         // 500px per second
        TRAIL_LENGTH: 10,   // Increased from 5
        WIDTH: 2,          // Missile width
        TRAIL_DECAY: 0.05,  // How quickly trail fades
    },

    EXPLOSION: {
        MIN_RADIUS: 10,
        MAX_RADIUS: 50,
        DURATION: 500,      // 0.5 seconds
        EXPAND_TIME: 250,   // Time to reach max size (ms)
    },

    ASTEROID: {
        INITIAL_SPAWN_RATE: 1500,    // 1.5 seconds (increased by 25% from 1200ms)
        MIN_SPAWN_RATE: 250,         // Minimum spawn rate increased by 25% (from 200ms)
        INITIAL_SPEED: 62.5,         // Speed increased by 25% (from 50px/s)
        MAX_SPEED: 218.75,           // Maximum speed increased by 25% (from 175px/s)
        SPEED_INCREMENT: 12.5,        // Speed increase increment increased by 25%
        SPAWN_RATE_DECREASE: 200,    // Keep this the same
        SIZE: 15,                    // Default asteroid size
    },

    TRAJECTORY: {
        VISIBLE: false,  // Trajectory lines hidden by default
    },

    SCORING: {
        BASE_POINTS: 10,            // Points for first asteroid
        MULTIPLIER_INCREMENT: 1,    // How much multiplier increases per additional asteroid
        POPUP_DURATION: 1000,       // How long score popups stay on screen
    },

    // UI
    MARKER: {
        SIZE: 6,           // Increased from 3
        LENGTH: 10,        // Length of cross lines
    },

    FONT: {
        FAMILY: 'Courier New, monospace',
        SIZE: {
            LARGE: '48px',
            MEDIUM: '24px',
            SMALL: '16px',
        },
    },
}; 
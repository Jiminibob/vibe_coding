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
    },

    // Game entities
    LAUNCHER: {
        COOLDOWN: 1000,     // 1 second between shots
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
        INITIAL_SPAWN_RATE: 2000,    // 2 seconds
        MIN_SPAWN_RATE: 500,         // Minimum time between spawns
        INITIAL_SPEED: 100,          // 100px per second
        MAX_SPEED: 300,              // Maximum speed
        SPEED_INCREMENT: 10,         // Speed increase per minute
        SPAWN_RATE_DECREASE: 100,    // Spawn rate decrease per minute (ms)
        SIZE: 15,                    // Default asteroid size
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
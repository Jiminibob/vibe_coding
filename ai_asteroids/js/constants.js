// Canvas
const CANVAS_HEIGHT = 720;

// Colors
const HERO_COLOR = 'yellow';

// Movement speeds
const HERO_MOVEMENT_SPEED = 200; // pixels per second (increased from 150)
const HERO_REVERSE_SPEED = 150; // pixels per second (increased from 75)
const HERO_ROTATION_SPEED = 2; // radians per second
const ASTEROID_SPEED = 100; // pixels per second

// Movement physics
const HERO_ACCELERATION = 50; // Reduced from 100 for even more gradual acceleration
const HERO_DECELERATION = 12; // Reduced from 25 for even more gradual deceleration

// Asteroid sizes
const ASTEROID_SIZES = {
    LARGE: 40,
    MEDIUM: 20,
    SMALL: 10
};

// Game timings
const FIRST_ASTEROID_SPAWN_DELAY = 1000; // 1 second
const INITIAL_ASTEROID_SPAWN_INTERVAL = 5000; // 5 seconds
const MINIMUM_ASTEROID_SPAWN_INTERVAL = 500; // 1 second
const TIME_TO_REACH_MIN_SPAWN = 90000; // 60 seconds (was 120)

// Shield
const SHIELD_SPAWN_INTERVAL = 10000; // 10 seconds (was 5)

// Weapons
const WEAPON_SPAWN_DELAY = 15000; // 15 seconds
const BULLET_SPEED = 725; // pixels per second (increased from 625)
const BULLET_LIFESPAN = 2000; // 2 seconds

// Weapon configurations
const WEAPONS = {
    1: {
        fireRate: 100, // 0.2 seconds
        bulletSize: 2,
        pattern: 'single',
        lastFired: 0,
        update: function(deltaTime) {
            // Weapon cooldown logic handled in Hero class
        }
    },
    2: {
        fireRate: 200, // 0.3 seconds
        bulletSize: 3,
        pattern: 'parallel-forward',
        lastFired: 0,
        update: function(deltaTime) {
            // Weapon cooldown logic handled in Hero class
        }
    },
    3: {
        fireRate: 300, // 0.3 seconds
        bulletSize: 4,
        pattern: 'parallel-forward',
        spacing: 3.0, // Doubled from 1.5
        lastFired: 0,
        update: function(deltaTime) {
            // Weapon cooldown logic handled in Hero class
        }
    },
    4: {
        fireRate: 400,
        bulletSize: 5,
        pattern: 'parallel-forward',
        spacing: 4.5, // Even wider spacing than weapon 3
        lastFired: 0,
        update: function(deltaTime) {
            // Weapon cooldown logic handled in Hero class
        }
    },
    5: {
        fireRate: 500,
        bulletSize: 6,
        pattern: 'parallel-forward',
        spacing: 6.0, // Even wider spacing
        lastFired: 0,
        update: function(deltaTime) {
            // Weapon cooldown logic handled in Hero class
        }
    },
    6: {
        fireRate: 600,
        bulletSize: 7,
        pattern: 'parallel-forward',
        spacing: 7.5, // Widest spacing
        lastFired: 0,
        update: function(deltaTime) {
            // Weapon cooldown logic handled in Hero class
        }
    }
}; 
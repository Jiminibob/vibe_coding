// Convert degrees to radians
const toRadians = (degrees) => degrees * Math.PI / 180;

// Convert radians to degrees
const toDegrees = (radians) => radians * 180 / Math.PI;

// Format time as MM:SS:MMM with rounded values
const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000 / 10); // Round to 2 digits (10s of milliseconds)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
};

// Get random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;

// Get random integer between min and max (inclusive)
const randomInt = (min, max) => Math.floor(random(min, max + 1));

// Get random point on the edge of the viewport
const getRandomEdgePosition = (width, height) => {
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    switch(edge) {
        case 0: return { x: random(0, width), y: 0 };
        case 1: return { x: width, y: random(0, height) };
        case 2: return { x: random(0, width), y: height };
        case 3: return { x: 0, y: random(0, height) };
    }
};

// Calculate distance between two points
const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

// Linear interpolation
const lerp = (start, end, t) => start + (end - start) * t;

// Check collision between two circles
const circleCollision = (x1, y1, r1, x2, y2, r2) => {
    return distance(x1, y1, x2, y2) < (r1 + r2);
};

// Get angle between two points
const getAngle = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

// Normalize angle to be between -PI and PI
const normalizeAngle = (angle) => {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}; 
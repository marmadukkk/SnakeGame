"use strict";

// Game settings constants
const GRID_SIZE = 25;           // Grid cell size (width/height)
const FPS = 20;                 // Game frames per second
const CANVAS_ID = "gP";         // Canvas element id

// Movement direction constants
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_UP = 4;

// Global variables for game state
let snakeBody = null; // Snake segments array; each segment is an object {x, y}
let currentDirection = DIRECTION_RIGHT;  // Current movement direction (on game start snake will go to right by default)
let applePosition = null; // Apple position stored as an array: [x, y]

// Retrieve the canvas element and its drawing context
const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext("2d");

// Initialize canvas dimensions to full window dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


/*
 * Returns a random number that is rounded to the nearest multiple of GRID_SIZE.
 * The random value will be between min (inclusive) and max (exclusive).
 */
function getRandomGridValue(min, max) {
    const randomValue = Math.floor(Math.random() * (max - min) + min);
    return Math.round(randomValue / GRID_SIZE) * GRID_SIZE;
}

/*
 * Sets a new apple position using random grid coordinates within the window dimensions.
 */
function spawnApple() {
    applePosition = [
        getRandomGridValue(0, window.innerWidth),
        getRandomGridValue(0, window.innerHeight)
    ];
}

/*
 * Resets the snake body to its initial state (a single segment at position {x: 0, y: 0}) 
 * and sets the default direction.
 */
function resetSnake() {
    snakeBody = [{ x: 0, y: 0 }];
    currentDirection = DIRECTION_RIGHT;
}

/*
 * Updates the snake's head based on the current movement direction.
 */
function computeNewHead() {
    const currentHead = snakeBody[snakeBody.length - 1];
    // Create a copy for new head coordinates
    let newHead = {
        x: currentHead.x,
        y: currentHead.y
    };

    switch (currentDirection) {
        case DIRECTION_RIGHT:
            newHead.x += GRID_SIZE;
            newHead.y = Math.round(newHead.y / GRID_SIZE) * GRID_SIZE;
            break;
        case DIRECTION_DOWN:
            newHead.y += GRID_SIZE;
            newHead.x = Math.round(newHead.x / GRID_SIZE) * GRID_SIZE;
            break;
        case DIRECTION_LEFT:
            newHead.x -= GRID_SIZE;
            newHead.y = Math.round(newHead.y / GRID_SIZE) * GRID_SIZE;
            break;
        case DIRECTION_UP:
            newHead.y -= GRID_SIZE;
            newHead.x = Math.round(newHead.x / GRID_SIZE) * GRID_SIZE;
            break;
        default:
            break;
    }

    return newHead;
}

/*
 * Checks if the snake head has collided with any other segment.
 * If collision is detected, the snake is reset.(lose)
 */
function checkSelfCollision() {
    const head = snakeBody[snakeBody.length - 1];
    // Loop over all segments except the head
    for (let index = 0; index < snakeBody.length - 1; index++) {
        if (snakeBody[index].x === head.x && snakeBody[index].y === head.y) {
            // Reset the snake upon collision
            resetSnake();
            break;
        }
    }
}

/*
 * Wraps the segment coordinates around the canvas if they go off-screen.
 */
function wrapSegment(segment) {
    // Horizontal wrapping for right or left
    if (segment.x >= canvas.width) {
        segment.x = 0;
    } else if (segment.x < 0) {
        segment.x = Math.round(canvas.width / GRID_SIZE) * GRID_SIZE;
    }
    // Vertical wrapping for down or up
    if (segment.y >= canvas.height) {
        segment.y = 0;
    } else if (segment.y < 0) {
        segment.y = Math.round(canvas.height / GRID_SIZE) * GRID_SIZE;
    }
}

/*
 * Checks if the given segment is at the same position as the apple.
 * If the apple is eaten, spawn a new apple and extend the snake.
 */
function checkAppleCollision(segment, newHead) {
    if (segment.x === applePosition[0] && segment.y === applePosition[1]) {

        const newScore = Number(document.getElementById('score').innerHTML) + 1;
        document.getElementById('score').innerHTML = newScore;

        spawnApple();
        // Extend snake: add an extra segment at the beginning of the snakeBody.
        // New segment is placed behind the current head.
        snakeBody.unshift({
            x: newHead.x - GRID_SIZE,
            y: newHead.y
        });
    }
}

/*
 * Clears the canvas and draws the apple and snake for the current game state.
 */
function renderFrame() {
    // If apple is too close to the edge, reposition it.
    if (applePosition[0] + GRID_SIZE >= canvas.width || applePosition[1] + GRID_SIZE >= canvas.height) {
        spawnApple();
    }

    // Clear the entire canvas before redrawing.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the apple in red.
    ctx.fillStyle = "red";
    ctx.fillRect(applePosition[0], applePosition[1], GRID_SIZE, GRID_SIZE);

    // Set snake drawing color (black)
    ctx.fillStyle = "#000";

    // Check for self-collision.
    checkSelfCollision();

    // Compute new head position and add it to the snake.
    const newHead = computeNewHead();
    snakeBody.push(newHead);
    // Remove the tail segment so that the snake moves forward.
    snakeBody.shift();

    // Draw each segment of the snake and check apple collisions and wrapping.
    snakeBody.forEach(segment => {
        wrapSegment(segment);
        checkAppleCollision(segment, newHead);
        ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });
}

/*
 * Handles keydown events to change the snake's movement direction.
 * Prevents reverse movements (e.g., cannot go left if moving right) and default browser actions.
 */
function handleKeyboardEvents(event) {
    const keyCode = event.keyCode;
    // Prevent default actions (e.g., scrolling) for arrow keys.
    if ([37, 38, 39, 40].includes(keyCode)) {
        event.preventDefault();
    }

    switch (keyCode) {
        case 39: // right arrow
            if (currentDirection !== DIRECTION_LEFT) {
                currentDirection = DIRECTION_RIGHT;
            }
            break;
        case 40: // down arrow
            if (currentDirection !== DIRECTION_UP) {
                currentDirection = DIRECTION_DOWN;
            }
            break;
        case 37: // left arrow
            if (currentDirection !== DIRECTION_RIGHT) {
                currentDirection = DIRECTION_LEFT;
            }
            break;
        case 38: // up arrow
            if (currentDirection !== DIRECTION_DOWN) {
                currentDirection = DIRECTION_UP;
            }
            break;
        default:
            break;
    }
}

/*
 * Initializes game state and starts the game loop.
 */
function initializeGame() {
    // Reset snake and spawn first apple.
    resetSnake();
    spawnApple();

    // Start the game loop.
    setInterval(renderFrame, 1000 / FPS);
}

// Listen for keydown events to change direction.
document.addEventListener("keydown", handleKeyboardEvents);

// Start the game.
initializeGame();

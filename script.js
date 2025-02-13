"use strict";

// ============================================
// game configuration and state variables
// ============================================
let currentScore = 0;
let isPaused = false;
let isDead = false;
const scoreElement = document.getElementById("score-display");
const COLLISION_SAFE_SEGMENTS = 4;

// core game constants
const GRID_SIZE = 25;
const FPS = 15;
const CANVAS_ID = "gP";
const SCORE_PER_APPLE = 100;

// movement directions
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_UP = 4;

// audio assets
const audio = {
  apple: new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2219/2219-preview.mp3"
  ),
  death: new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3"
  ),
};

// game objects
let snakeBody = [];
let currentDirection = DIRECTION_RIGHT;
let applePosition = null;

// canvas setup
const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ============================================
// core game logic
// ============================================

// initialize audio system
[audio.apple, audio.death].forEach((sound) => {
  sound.preload = "auto";
  sound.volume = 0.3;
});

// generate grid-aligned position
function getRandomGridValue(min, max) {
  return (
    Math.floor((Math.random() * (max - min)) / GRID_SIZE) * GRID_SIZE + min
  );
}

// spawn new apple at valid position
function spawnApple() {
  applePosition = [
    getRandomGridValue(0, canvas.width - GRID_SIZE),
    getRandomGridValue(0, canvas.height - GRID_SIZE),
  ];
}

// reset snake to initial state
function resetSnake() {
  snakeBody = [
    { x: GRID_SIZE * 4, y: GRID_SIZE * 4 },
    { x: GRID_SIZE * 3, y: GRID_SIZE * 4 },
    { x: GRID_SIZE * 2, y: GRID_SIZE * 4 },
  ];
  currentDirection = DIRECTION_RIGHT;
  currentScore = 0;
  scoreElement.textContent = `🍎 ${currentScore}`;
}

// calculate new head position
function computeNewHead() {
  const head = snakeBody[snakeBody.length - 1];
  const newHead = { x: head.x, y: head.y };

  switch (currentDirection) {
    case DIRECTION_RIGHT:
      newHead.x += GRID_SIZE;
      break;
    case DIRECTION_DOWN:
      newHead.y += GRID_SIZE;
      break;
    case DIRECTION_LEFT:
      newHead.x -= GRID_SIZE;
      break;
    case DIRECTION_UP:
      newHead.y -= GRID_SIZE;
      break;
  }
  return newHead;
}

// check boundary collision
function checkBoundaryCollision(pos) {
  return (
    pos.x < 0 || pos.x >= canvas.width || pos.y < 0 || pos.y >= canvas.height
  );
}

// ============================================
// death and reset system
// ============================================

// handle game over state
function handleDeath() {
  isDead = true;
  audio.death.currentTime = 0;
  audio.death.play();
  document.querySelector(".game-over-popup").style.display = "flex";
  document.getElementById("final-score").textContent = currentScore;
}

// reset game to initial state
function resetGame() {
  document.querySelector(".game-over-popup").style.display = "none";
  isDead = false;
  isPaused = false;
  resetSnake();
  spawnApple();
}

// ============================================
// rendering and game loop
// ============================================

// update snake position and check collisions
function updateSnakePosition() {
  const newHead = computeNewHead();

  if (checkBoundaryCollision(newHead)) {
    handleDeath();
    return;
  }

  const hasSelfCollision = snakeBody
    .slice(0, -COLLISION_SAFE_SEGMENTS)
    .some((segment) => segment.x === newHead.x && segment.y === newHead.y);

  if (hasSelfCollision) {
    handleDeath();
    return;
  }

  snakeBody.push(newHead);
  snakeBody.shift();

  if (newHead.x === applePosition[0] && newHead.y === applePosition[1]) {
    audio.apple.currentTime = 0;
    audio.apple.play();
    spawnApple();
    snakeBody.unshift({ ...snakeBody[0] });
    snakeBody.unshift({ ...snakeBody[0] });
    currentScore += SCORE_PER_APPLE;
    scoreElement.textContent = `🍎 ${currentScore}`;
  }
}

// main render function
function renderFrame() {
  if (isPaused || isDead) return;
  updateSnakePosition();

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw apple
  ctx.beginPath();
  ctx.arc(
    applePosition[0] + GRID_SIZE / 2,
    applePosition[1] + GRID_SIZE / 2,
    (GRID_SIZE / 2) * 0.8,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#e74c3c";
  ctx.fill();
  ctx.strokeStyle = "#c0392b";
  ctx.stroke();

  // draw snake
  snakeBody.forEach((segment) => {
    const glow = ctx.createRadialGradient(
      segment.x + GRID_SIZE / 2,
      segment.y + GRID_SIZE / 2,
      0,
      segment.x + GRID_SIZE / 2,
      segment.y + GRID_SIZE / 2,
      GRID_SIZE
    );
    glow.addColorStop(0, "#2ecc71aa");
    glow.addColorStop(1, "#27ae6000");

    const bodyGradient = ctx.createLinearGradient(
      segment.x,
      segment.y,
      segment.x + GRID_SIZE,
      segment.y + GRID_SIZE
    );
    bodyGradient.addColorStop(0, "#2ecc71");
    bodyGradient.addColorStop(1, "#27ae60");

    ctx.fillStyle = glow;
    ctx.fillRect(
      segment.x - 10,
      segment.y - 10,
      GRID_SIZE + 20,
      GRID_SIZE + 20
    );
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
  });
}

// ============================================
// input handling and initialization
// ============================================

// process keyboard input
function handleKeyboardEvents(event) {
  const key = event.keyCode;

  if ([37, 38, 39, 40].includes(key)) event.preventDefault();

  if (key === 32 && !isDead) {
    isPaused = !isPaused;
    document.querySelector(".controls-info").textContent = isPaused
      ? "⏸ paused"
      : "←↑→↓ to move • space to pause";
    return;
  }

  if (!isDead && !isPaused) {
    switch (key) {
      case 39:
        if (currentDirection !== DIRECTION_LEFT)
          currentDirection = DIRECTION_RIGHT;
        break;
      case 40:
        if (currentDirection !== DIRECTION_UP)
          currentDirection = DIRECTION_DOWN;
        break;
      case 37:
        if (currentDirection !== DIRECTION_RIGHT)
          currentDirection = DIRECTION_LEFT;
        break;
      case 38:
        if (currentDirection !== DIRECTION_DOWN)
          currentDirection = DIRECTION_UP;
        break;
    }
  }
}

// initialize game systems
function initializeGame() {
  resetSnake();
  spawnApple();
  setInterval(renderFrame, 1000 / FPS);
  document.addEventListener("keydown", handleKeyboardEvents);
}

// start game execution
initializeGame();

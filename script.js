"use strict";

// ============================================
// Конфигурация игры и переменные состояния
// ============================================
let currentScore = 0; // Текущие очки игрока
let isPaused = false; // Флаг паузы игры
let isDead = false; // Флаг завершения игры
const scoreElement = document.getElementById("score-display"); // Элемент для отображения очков
const COLLISION_SAFE_SEGMENTS = 4; // Защита от ложных коллизий с новыми сегментами

// Основные константы игры
const GRID_SIZE = 25; // Размер клетки сетки в пикселях
const FPS = 15; // Кадры в секунду (скорость обновления игры)
const CANVAS_ID = "gP"; // ID игрового холста
const SCORE_PER_APPLE = 100; // Очков за одно яблоко

// Направления движения змейки
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_UP = 4;

// Звуковые эффекты
const audio = {
  apple: new Audio("https://assets.mixkit.co/active_storage/sfx/2219/2219-preview.mp3"), // Звук съедания яблока
  death: new Audio("https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3"), // Звук проигрыша
};

// Настройка размеров холста
function setCanvasSize() {
  const headerHeight = document.querySelector(".game-header").offsetHeight;
  const controlsHeight = document.querySelector(".controls-info").offsetHeight;
  canvas.width = Math.min(window.innerWidth, 800);
  canvas.height = window.innerHeight - headerHeight - controlsHeight - 50;
}

// Игровые объекты
let snakeBody = []; // Сегменты тела змейки
let currentDirection = DIRECTION_RIGHT; // Текущее направление движения
let applePosition = null; // Позиция яблока на поле

// Инициализация холста
const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ============================================
// Основная игровая логика
// ============================================

// Предзагрузка звуков
[audio.apple, audio.death].forEach((sound) => {
  sound.preload = "auto";
  sound.volume = 0.3;
});

// Генерация позиции с учетом сетки
function getRandomGridValue(min, max) {
  return Math.floor((Math.random() * (max - min)) / GRID_SIZE) * GRID_SIZE + min;
}

// Создание нового яблока в случайной позиции
function spawnApple() {
  applePosition = [
    getRandomGridValue(0, canvas.width - GRID_SIZE),
    getRandomGridValue(0, canvas.height - GRID_SIZE),
  ];
}

// Сброс змейки в начальное состояние
function resetSnake() {
  snakeBody = [
    { x: GRID_SIZE * 4, y: GRID_SIZE * 4 }, // Начальная позиция головы
    { x: GRID_SIZE * 3, y: GRID_SIZE * 4 }, // Первый сегмент
    { x: GRID_SIZE * 2, y: GRID_SIZE * 4 }, // Второй сегмент
  ];
  currentDirection = DIRECTION_RIGHT; // Начальное направление
  currentScore = 0; // Сброс очков
  scoreElement.textContent = `🍎 ${currentScore}`; // Обновление интерфейса
}

// Вычисление новой позиции головы
function computeNewHead() {
  const head = snakeBody[snakeBody.length - 1]; // Текущая голова
  const newHead = { x: head.x, y: head.y }; // Копирование позиции

  // Обновление координат в зависимости от направления
  switch (currentDirection) {
    case DIRECTION_RIGHT: newHead.x += GRID_SIZE; break;
    case DIRECTION_DOWN: newHead.y += GRID_SIZE; break;
    case DIRECTION_LEFT: newHead.x -= GRID_SIZE; break;
    case DIRECTION_UP: newHead.y -= GRID_SIZE; break;
  }
  return newHead;
}

// Проверка выхода за границы холста
function checkBoundaryCollision(pos) {
  return (
    pos.x < 0 || pos.x >= canvas.width || 
    pos.y < 0 || pos.y >= canvas.height
  );
}

// ============================================
// Система завершения игры и рестарта
// ============================================

// Обработка смерти игрока
function handleDeath() {
  isDead = true;
  audio.death.currentTime = 0;
  audio.death.play();
  document.querySelector(".game-over-popup").style.display = "flex";
  document.getElementById("final-score").textContent = currentScore;
}

// Полный сброс игры
function resetGame() {
  document.querySelector(".game-over-popup").style.display = "none";
  isDead = false;
  isPaused = false;
  resetSnake();
  spawnApple();
}

// ============================================
// Отрисовка и игровой цикл
// ============================================

// Обновление позиции змейки и проверка коллизий
function updateSnakePosition() {
  const newHead = computeNewHead();

  // Проверка столкновения с границами
  if (checkBoundaryCollision(newHead)) {
    handleDeath();
    return;
  }

  // Проверка самопересечения (исключая последние 4 сегмента)
  const hasSelfCollision = snakeBody
    .slice(0, -COLLISION_SAFE_SEGMENTS)
    .some(segment => segment.x === newHead.x && segment.y === newHead.y);

  if (hasSelfCollision) {
    handleDeath();
    return;
  }

  snakeBody.push(newHead); // Добавление новой головы
  snakeBody.shift(); // Удаление хвоста

  // Проверка съедания яблока
  if (newHead.x === applePosition[0] && newHead.y === applePosition[1]) {
    audio.apple.play();
    spawnApple();
    // Увеличение змейки на 2 сегмента
    snakeBody.unshift({ ...snakeBody[0] });
    snakeBody.unshift({ ...snakeBody[0] });
    currentScore += SCORE_PER_APPLE;
    scoreElement.textContent = `🍎 ${currentScore}`;
  }
}

// Основная функция отрисовки
function renderFrame() {
  if (isPaused || isDead) return;
  updateSnakePosition();

  // Очистка холста
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Отрисовка яблока
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

  // Отрисовка змейки с эффектами
  snakeBody.forEach((segment) => {
    // Создание градиента для свечения
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

    // Градиент для тела змейки
    const bodyGradient = ctx.createLinearGradient(
      segment.x,
      segment.y,
      segment.x + GRID_SIZE,
      segment.y + GRID_SIZE
    );
    bodyGradient.addColorStop(0, "#2ecc71");
    bodyGradient.addColorStop(1, "#27ae60");

    // Отрисовка свечения
    ctx.fillStyle = glow;
    ctx.fillRect(
      segment.x - 10,
      segment.y - 10,
      GRID_SIZE + 20,
      GRID_SIZE + 20
    );
    
    // Отрисовка сегмента тела
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
  });
}

// ============================================
// Обработка ввода и инициализация
// ============================================

// Обработка клавиатуры
function handleKeyboardEvents(event) {
  const key = event.keyCode;

  if ([37, 38, 39, 40].includes(key)) event.preventDefault();

  // Пауза по пробелу
  if (key === 32 && !isDead) {
    isPaused = !isPaused;
    document.querySelector(".controls-info").textContent = isPaused
      ? "⏸ paused"
      : "←↑→↓ to move • space to pause";
    return;
  }

  // Изменение направления движения
  if (!isDead && !isPaused) {
    switch (key) {
      case 39: // Стрелка вправо
        if (currentDirection !== DIRECTION_LEFT) currentDirection = DIRECTION_RIGHT;
        break;
      case 40: // Стрелка вниз
        if (currentDirection !== DIRECTION_UP) currentDirection = DIRECTION_DOWN;
        break;
      case 37: // Стрелка влево
        if (currentDirection !== DIRECTION_RIGHT) currentDirection = DIRECTION_LEFT;
        break;
      case 38: // Стрелка вверх
        if (currentDirection !== DIRECTION_DOWN) currentDirection = DIRECTION_UP;
        break;
    }
  }
}

// Инициализация игры
function initializeGame() {
  window.addEventListener("resize", setCanvasSize);
  setCanvasSize();
  resetSnake();
  spawnApple();
  setInterval(renderFrame, 1000 / FPS); // Запуск игрового цикла
  document.addEventListener("keydown", handleKeyboardEvents);
}

// Запуск игры
initializeGame();

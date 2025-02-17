# SnakeGame 🐍

simple implementation of the "Snake" game using JavaScript and the HTML5 canvas.

- **Canvas & Grid:**  
  - The game is rendered on a full-screen canvas.  
  - The grid size defines each cell's width and height, ensuring movements align to the grid.

- **Game Mechanics:**  
  - The snake moves automatically(user can rotate it in process) by appending a new head and removing the tail, creating a smooth movement effect.  

  - An apple spawns at a random position on the grid. When the snake eats the apple, it grows by extending its body, and a new apple appears on desk.
  
- **Collision Handling:**  
  - If the snake collides with itself, it resets to its initial state(game losed) (a single segment starting at {0, 0}).  
  - When the snake moves off one edge of the canvas, it uses a wrapping effect, reappearing on the opposite side.

- **User Controls:**  
  - Direction control is handled via keyboard arrow keys.  
  - Reverse movements are prevented (e.g., the snake cannot instantly switch from moving right to moving left).

## Usage

Open `index.html` in your browser and click the "Start Game" button to play.

Enjoy!


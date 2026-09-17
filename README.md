# Sudoku Game

## Project Overview

This project is a Python Flask Sudoku application with a browser-based interface. It generates valid puzzles with unique solutions, supports multiple difficulty levels, and provides tools that help players solve and review puzzles.

## Features

- Easy, Medium, and Hard difficulty levels
- Unique-solution puzzle generation
- Locked prefilled cells
- Immediate invalid-move feedback
- Check Solution functionality
- Hint functionality
- Elapsed-time timer
- Top 10 fastest leaderboard
- Browser `localStorage` persistence for leaderboard and theme preferences
- Dark Mode
- Responsive desktop and mobile design
- Alternating 3x3 box styling

## Installation and Setup

Requirements:

- Python 3
- A modern web browser

From the repository root, open a terminal and enter the application directory:

```bash
cd starter
```

Create and activate a virtual environment if desired:

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install the project dependencies:

```bash
python -m pip install -r requirements.txt
```

## How to Run the Application

From the `starter` directory:

```bash
python app.py
```

Open the application at [http://127.0.0.1:5000](http://127.0.0.1:5000).

## How to Run Python Tests

From the `starter` directory:

```bash
python -m pytest
```

This runs the Flask, Sudoku logic, responsive-style, and stylesheet tests.

## How to Run JavaScript Tests

From the `starter` directory:

```bash
node --test tests/test_new_game.js tests/test_timer.js tests/test_leaderboard.js tests/test_theme.js
```

To check the browser scripts for syntax errors:

```bash
node --check static/main.js
node --check static/timer.js
node --check static/leaderboard.js
node --check static/theme.js
```

## Project Structure

```text
starter/
├── app.py
├── requirements.txt
├── sudoku_logic.py
├── sudoku/
│   └── solver.py
├── static/
│   ├── leaderboard.js
│   ├── main.js
│   ├── styles.css
│   ├── theme.js
│   └── timer.js
├── templates/
│   └── index.html
├── tests/
│   ├── conftest.py
│   ├── test_app.py
│   ├── test_leaderboard.js
│   ├── test_new_game.js
│   ├── test_responsive_styles.py
│   ├── test_styles.py
│   ├── test_sudoku_logic.py
│   ├── test_theme.js
│   └── test_timer.js
└── Screenshots/
```

### Important Backend Files

- `app.py` defines the Flask routes for the game page, new puzzles, solution checks, and hints. It validates request data and keeps the current puzzle and solution for the running application.
- `sudoku_logic.py` contains board creation, difficulty clue configuration, puzzle generation, solution counting, move validation, hint selection, and incorrect-cell detection.
- `sudoku/solver.py` contains the backtracking solver used to create complete Sudoku solution boards.

### Important Frontend Files

- `templates/index.html` defines the game page, controls, timer, board container, and leaderboard container.
- `static/main.js` renders the board, handles difficulty selection, new games, invalid-move feedback, Check Solution, hints, timer integration, and leaderboard completion handling.
- `static/timer.js` provides the reusable elapsed-time timer.
- `static/leaderboard.js` stores, validates, sorts, and limits leaderboard entries in browser `localStorage`.
- `static/theme.js` manages Dark Mode and persists the selected theme in its own `localStorage` key.
- `static/styles.css` defines the board layout, cell states, alternating 3x3 box styling, themes, controls, and responsive mobile rules.

## Screenshots

Screenshots documenting the development and GitHub Copilot milestones are stored in the `starter/Screenshots` folder. They include examples of the difficulty selector, hints, invalid-move feedback, timer, leaderboard, Dark Mode, responsive layout, unique-solution work, and the final working application.

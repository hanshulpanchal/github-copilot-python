# Sudoku Project Instructions

## Project Overview

This project is a Python Flask Sudoku application.

The goal is to refactor the legacy application and add:
- Easy, Medium, and Hard difficulty levels
- Unique-solution puzzle generation
- Input validation
- Hints
- Timer
- Top 10 fastest leaderboard
- Browser localStorage persistence
- Dark mode
- Responsive design
- Improved Sudoku board styling

## Code Quality

- Write clean, readable, and maintainable Python.
- Prefer small, focused functions.
- Use meaningful variable and function names.
- Avoid unnecessary code duplication.
- Keep responsibilities separated.
- Add comments when logic is not immediately obvious.
- Use consistent error handling.
- Do not introduce unnecessary dependencies.

## Sudoku Logic

- Every generated Sudoku puzzle must have exactly one valid solution.
- Rows, columns, and 3x3 boxes must follow standard Sudoku rules.
- Prefilled cells must not be editable.
- Difficulty levels must control the number of prefilled cells.
- Validate generated puzzles before displaying them.

## Flask Architecture

- Keep Flask routes focused on HTTP/application behavior.
- Keep Sudoku/game logic separate from route handling where practical.
- Do not put large amounts of business logic directly inside Flask routes.
- Prefer modular and reusable components.

## Frontend

- Use semantic HTML.
- Keep JavaScript organized and readable.
- Use responsive CSS for desktop and mobile screens.
- Support both light and dark modes.
- Maintain readable contrast in both modes.
- Use alternating styling for the 3x3 Sudoku boxes.
- Keep controls clear and accessible.

## Testing

- Use automated tests for core Sudoku functionality.
- Run tests after significant changes.
- Do not delete or weaken tests just to make them pass.
- When behavior changes, update or add appropriate tests.
- Test edge cases as well as normal cases.

## Git

- Make focused changes.
- Do not modify unrelated files.
- Prefer small, logical commits.
- Explain significant architectural changes.

## GitHub Copilot Usage

Before implementing a significant feature:
1. Analyze the existing code first.
2. Explain the proposed approach.
3. Identify the files that will be affected.
4. Mention important edge cases.
5. Keep changes focused on the requested feature.

Do not assume generated code is automatically correct.

Review Copilot suggestions before accepting them.

When a suggestion is incorrect, unnecessary, or risky, reject it and explain why.

Prefer simple solutions over unnecessarily complex implementations.
// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let gameTimer;
let leaderboard;
let themeManager;
let currentDifficulty = 'easy';
let hintCount = 0;
let gameCompleted = false;

function getCurrentBoard() {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  const board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  for (const input of inputs) {
    const row = parseInt(input.dataset.row, 10);
    const column = parseInt(input.dataset.col, 10);
    const value = input.value;
    board[row][column] = value ? parseInt(value, 10) : 0;
  }
  return board;
}

function isValidMove(board, row, col, value) {
  for (let index = 0; index < SIZE; index++) {
    if (index !== col && board[row][index] === value) return false;
    if (index !== row && board[index][col] === value) return false;
  }

  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let boxRow = startRow; boxRow < startRow + 3; boxRow++) {
    for (let boxCol = startCol; boxCol < startCol + 3; boxCol++) {
      if ((boxRow !== row || boxCol !== col) && board[boxRow][boxCol] === value) {
        return false;
      }
    }
  }
  return true;
}

function updateInvalidState(input) {
  const value = parseInt(input.value, 10);
  if (!value) {
    input.classList.remove('invalid');
    return;
  }

  const board = getCurrentBoard();
  const row = parseInt(input.dataset.row, 10);
  const col = parseInt(input.dataset.col, 10);
  input.classList.toggle('invalid', !isValidMove(board, row, col, value));
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.replaceChildren();
  leaderboard.load().forEach((entry) => {
    const item = document.createElement('li');
    const difficulty = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);
    item.textContent = `${entry.playerName} - ${SudokuTimer.formatElapsedTime(entry.completionTime)} - ${difficulty} - ${entry.hintsUsed} hint${entry.hintsUsed === 1 ? '' : 's'}`;
    list.appendChild(item);
  });
}

function recordCompletedGame() {
  if (gameCompleted) return;

  gameCompleted = true;
  gameTimer.stop();
  const nameInput = document.getElementById('player-name');
  let playerName = nameInput.value.trim();
  if (!playerName) {
    playerName = window.prompt('Enter your name for the leaderboard:') || 'Anonymous';
    nameInput.value = playerName;
  }

  leaderboard.addEntry({
    playerName,
    completionTime: gameTimer.elapsedSeconds,
    difficulty: currentDifficulty,
    hintsUsed: hintCount
  });
  renderLeaderboard();
}

function updateThemeButton() {
  const button = document.getElementById('theme-toggle');
  const isDark = themeManager.theme === SudokuTheme.DARK_THEME;
  button.innerText = isDark ? 'Light Mode' : 'Dark Mode';
  button.setAttribute('aria-pressed', String(isDark));
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        updateInvalidState(e.target);
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const message = document.getElementById('message');
  gameTimer.start();

  try {
    const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
    if (!res.ok) {
      throw new Error('Puzzle request failed');
    }

    const data = await res.json();
    if (!isValidPuzzle(data.puzzle)) {
      throw new Error('Puzzle response was invalid');
    }

    renderPuzzle(data.puzzle);
  } catch (error) {
    gameTimer.stop();
    message.style.color = 'var(--message-error)';
    message.innerText = 'Unable to load a new puzzle. Please try again.';
    return;
  }

  currentDifficulty = difficulty;
  hintCount = 0;
  gameCompleted = false;
  message.innerText = '';
}

function isValidPuzzle(candidate) {
  return Array.isArray(candidate) && candidate.length === SIZE &&
    candidate.every((row) => Array.isArray(row) && row.length === SIZE &&
      row.every((value) => Number.isInteger(value) && value >= 0 && value <= SIZE));
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = getCurrentBoard();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = 'var(--message-error)';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (const inp of inputs) {
    const row = parseInt(inp.dataset.row, 10);
    const column = parseInt(inp.dataset.col, 10);
    const cellIndex = row * SIZE + column;
    if (inp.disabled) continue;
    const shouldHighlight = board[row][column] === 0 || incorrect.has(cellIndex);
    inp.classList.toggle('incorrect', shouldHighlight);
  }
  const boardIsComplete = board.every((row) => row.every((value) => value !== 0));
  if (incorrect.size === 0 && boardIsComplete) {
    recordCompletedGame();
    msg.style.color = 'var(--message-success)';
    msg.innerText = 'Congratulations! You solved it!';
  } else if (incorrect.size === 0) {
    msg.style.color = 'var(--message-error)';
    msg.innerText = 'Some cells are incorrect.';
  } else {
    msg.style.color = 'var(--message-error)';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function requestHint() {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board: getCurrentBoard()})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = 'var(--message-error)';
    msg.innerText = data.error;
    return;
  }
  if (!data.hint) {
    msg.style.color = 'var(--message-neutral)';
    msg.innerText = data.message;
    return;
  }

  const {row, col, value} = data.hint;
  const input = inputs[row * SIZE + col];
  input.value = value;
  input.disabled = true;
  input.classList.remove('invalid', 'incorrect');
  input.classList.add('hinted');
  hintCount += 1;
  if (!getCurrentBoard().some((row) => row.includes(0))) {
    await checkSolution();
    return;
  }
  msg.style.color = 'var(--message-success)';
  msg.innerText = 'A cell was filled in for you.';
}

// Wire buttons
window.addEventListener('load', () => {
  themeManager = new SudokuTheme.ThemeManager();
  themeManager.load();
  themeManager.apply(document.body);
  leaderboard = new SudokuLeaderboard.Leaderboard();
  gameTimer = new SudokuTimer.GameTimer((elapsedSeconds) => {
    document.getElementById('timer').innerText = SudokuTimer.formatElapsedTime(elapsedSeconds);
  });
  renderLeaderboard();
  document.getElementById('theme-toggle').addEventListener('click', () => {
    themeManager.toggle(document.body);
    updateThemeButton();
  });
  updateThemeButton();
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint').addEventListener('click', requestHint);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  // initialize
  newGame();
});
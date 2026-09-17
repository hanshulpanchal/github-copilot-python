const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

function loadNewGameSource() {
  return require('node:fs').readFileSync(path.join(__dirname, '..', 'static', 'main.js'), 'utf8');
}

test('newGame starts the timer before awaiting the puzzle request', () => {
  const source = loadNewGameSource();
  const newGameBody = source.match(/async function newGame\(\) \{[\s\S]*?\n\}/)[0];

  assert.ok(newGameBody.indexOf('gameTimer.start();') < newGameBody.indexOf('await fetch('));
});

test('newGame handles HTTP failures, invalid puzzles, and fetch errors', () => {
  const source = loadNewGameSource();
  const newGameBody = source.match(/async function newGame\(\) \{[\s\S]*?\n\}/)[0];

  assert.match(newGameBody, /if \(!res\.ok\)/);
  assert.match(newGameBody, /isValidPuzzle\(data\.puzzle\)/);
  assert.match(newGameBody, /catch \(error\)/);
  assert.match(newGameBody, /Unable to load a new puzzle/);
  assert.match(newGameBody, /gameTimer\.stop\(\)/);
});

test('checkSolution maps cells using row and column data attributes', () => {
  const source = loadNewGameSource();
  const checkBody = source.match(/async function checkSolution\(\) \{[\s\S]*?\n\}/)[0];

  assert.match(checkBody, /parseInt\(inp\.dataset\.row, 10\)/);
  assert.match(checkBody, /parseInt\(inp\.dataset\.col, 10\)/);
  assert.match(checkBody, /board\[row\]\[column\] === 0/);
  assert.match(checkBody, /incorrect\.has\(cellIndex\)/);
  assert.match(checkBody, /classList\.toggle\('incorrect', shouldHighlight\)/);
  assert.match(checkBody, /Some cells are incorrect\./);
});

test('getCurrentBoard reads each cell using its data attributes', () => {
  const source = loadNewGameSource();
  const boardBody = source.match(/function getCurrentBoard\(\) \{[\s\S]*?\n\}/)[0];

  assert.match(boardBody, /input\.dataset\.row/);
  assert.match(boardBody, /input\.dataset\.col/);
  assert.match(boardBody, /board\[row\]\[column\]/);
});
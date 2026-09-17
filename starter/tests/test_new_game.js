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
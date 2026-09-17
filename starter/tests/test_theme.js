const assert = require('node:assert/strict');
const test = require('node:test');

const {
  DARK_THEME,
  LIGHT_THEME,
  STORAGE_KEY,
  ThemeManager,
  normalizeTheme
} = require('../static/theme.js');

function createStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem() {
      return value;
    },
    setItem(key, nextValue) {
      assert.equal(key, STORAGE_KEY);
      value = nextValue;
    }
  };
}

function createRootElement() {
  const classes = new Set();
  return {
    classes,
    classList: {
      toggle(className, enabled) {
        if (enabled) classes.add(className);
        else classes.delete(className);
      }
    }
  };
}

test('theme normalization defaults invalid values to light', () => {
  assert.equal(normalizeTheme(DARK_THEME), DARK_THEME);
  assert.equal(normalizeTheme(LIGHT_THEME), LIGHT_THEME);
  assert.equal(normalizeTheme('sepia'), LIGHT_THEME);
  assert.equal(normalizeTheme(null), LIGHT_THEME);
});

test('dark theme persists and applies across manager instances', () => {
  const storage = createStorage();
  const root = createRootElement();
  const first = new ThemeManager(storage);

  first.set(DARK_THEME, root);
  const second = new ThemeManager(storage);

  assert.equal(second.load(), DARK_THEME);
  second.apply(root);
  assert.equal(root.classes.has('dark-mode'), true);
});

test('toggle returns to light theme and removes dark class', () => {
  const manager = new ThemeManager(createStorage(DARK_THEME));
  const root = createRootElement();

  manager.load();
  manager.apply(root);
  manager.toggle(root);

  assert.equal(manager.theme, LIGHT_THEME);
  assert.equal(root.classes.has('dark-mode'), false);
});

test('missing or corrupted theme storage falls back to light', () => {
  assert.equal(new ThemeManager(createStorage()).load(), LIGHT_THEME);
  assert.equal(new ThemeManager(createStorage('sepia')).load(), LIGHT_THEME);
  assert.notEqual(STORAGE_KEY, 'sudokuLeaderboard');
});

test('theme remains usable when storage throws errors', () => {
  const failingStorage = {
    getItem() {
      throw new Error('read failed');
    },
    setItem() {
      throw new Error('write failed');
    }
  };
  const root = createRootElement();
  const manager = new ThemeManager(failingStorage);

  assert.equal(manager.load(), LIGHT_THEME);
  assert.equal(manager.set(DARK_THEME, root), DARK_THEME);
  assert.equal(root.classes.has('dark-mode'), true);
});

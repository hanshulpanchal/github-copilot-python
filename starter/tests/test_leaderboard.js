const assert = require('node:assert/strict');
const test = require('node:test');

const {
  Leaderboard,
  MAX_ENTRIES,
  STORAGE_KEY
} = require('../static/leaderboard.js');

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

function entry(playerName, completionTime) {
  return {
    playerName,
    completionTime,
    difficulty: 'medium',
    hintsUsed: 1
  };
}

test('leaderboard sorts entries and keeps only the top ten', () => {
  const leaderboard = new Leaderboard(createStorage());

  for (let time = 12; time >= 1; time--) {
    leaderboard.addEntry(entry(`Player ${time}`, time));
  }

  const entries = leaderboard.load();
  assert.equal(entries.length, MAX_ENTRIES);
  assert.deepEqual(entries.map((item) => item.completionTime), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('leaderboard persists entries across instances', () => {
  const storage = createStorage();
  const first = new Leaderboard(storage);
  first.addEntry({
    playerName: 'Ada',
    completionTime: 42,
    difficulty: 'hard',
    hintsUsed: 3
  });

  const second = new Leaderboard(storage);

  assert.deepEqual(second.load(), [{
    playerName: 'Ada',
    completionTime: 42,
    difficulty: 'hard',
    hintsUsed: 3
  }]);
});

test('leaderboard handles corrupted and invalid stored data', () => {
  const corruptedStorage = createStorage('{not valid json');
  assert.deepEqual(new Leaderboard(corruptedStorage).load(), []);

  const invalidEntriesStorage = createStorage(JSON.stringify([
    entry('Valid', 10),
    {playerName: '', completionTime: 2, difficulty: 'easy', hintsUsed: 0},
    {playerName: 'Bad time', completionTime: 'fast', difficulty: 'easy', hintsUsed: 0}
  ]));

  assert.deepEqual(new Leaderboard(invalidEntriesStorage).load(), [entry('Valid', 10)]);
});

test('leaderboard handles unavailable storage gracefully', () => {
  const failingStorage = {
    getItem() {
      throw new Error('read failed');
    },
    setItem() {
      throw new Error('write failed');
    }
  };
  const leaderboard = new Leaderboard(failingStorage);

  assert.deepEqual(leaderboard.load(), []);
  assert.deepEqual(leaderboard.addEntry(entry('Graceful', 15)), [entry('Graceful', 15)]);
});

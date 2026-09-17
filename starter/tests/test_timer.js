const assert = require('node:assert/strict');
const test = require('node:test');

const {GameTimer, formatElapsedTime} = require('../static/timer.js');

function createFakeScheduler() {
  let nextId = 1;
  const callbacks = new Map();
  const cleared = [];

  return {
    callbacks,
    cleared,
    setInterval(callback) {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    clearInterval(id) {
      cleared.push(id);
      callbacks.delete(id);
    }
  };
}

test('formatElapsedTime uses MM:SS', () => {
  assert.equal(formatElapsedTime(0), '00:00');
  assert.equal(formatElapsedTime(65), '01:05');
  assert.equal(formatElapsedTime(600), '10:00');
});

test('GameTimer resets, ticks, and stops', () => {
  const scheduler = createFakeScheduler();
  const updates = [];
  const timer = new GameTimer((seconds) => updates.push(seconds), scheduler);

  timer.start();
  const intervalId = [...scheduler.callbacks.keys()][0];
  scheduler.callbacks.get(intervalId)();
  scheduler.callbacks.get(intervalId)();

  assert.deepEqual(updates, [0, 1, 2]);
  assert.equal(timer.isRunning(), true);

  timer.stop();

  assert.equal(timer.isRunning(), false);
  assert.deepEqual(scheduler.cleared, [intervalId]);
});

test('starting again resets elapsed time and clears the old interval', () => {
  const scheduler = createFakeScheduler();
  const updates = [];
  const timer = new GameTimer((seconds) => updates.push(seconds), scheduler);

  timer.start();
  const firstIntervalId = [...scheduler.callbacks.keys()][0];
  scheduler.callbacks.get(firstIntervalId)();
  timer.start();

  assert.deepEqual(updates, [0, 1, 0]);
  assert.deepEqual(scheduler.cleared, [firstIntervalId]);
  assert.equal(timer.isRunning(), true);
});

test('default browser scheduler starts without illegal invocation', () => {
  const timer = new GameTimer(() => {});

  timer.start();
  assert.equal(timer.isRunning(), true);
  timer.stop();
  assert.equal(timer.isRunning(), false);
});

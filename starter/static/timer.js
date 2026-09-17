(function (root, factory) {
  const timerApi = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = timerApi;
  } else {
    root.SudokuTimer = timerApi;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const defaultScheduler = {
    setInterval: (...args) => globalThis.setInterval(...args),
    clearInterval: (...args) => globalThis.clearInterval(...args)
  };

  function formatElapsedTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  class GameTimer {
    constructor(onTick, scheduler = defaultScheduler) {
      this.onTick = onTick;
      this.scheduler = scheduler;
      this.elapsedSeconds = 0;
      this.intervalId = null;
    }

    start() {
      this.stop();
      this.elapsedSeconds = 0;
      this.onTick(this.elapsedSeconds);
      this.intervalId = this.scheduler.setInterval(() => {
        this.elapsedSeconds += 1;
        this.onTick(this.elapsedSeconds);
      }, 1000);
    }

    stop() {
      if (this.intervalId !== null) {
        this.scheduler.clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    isRunning() {
      return this.intervalId !== null;
    }
  }

  return {GameTimer, formatElapsedTime};
});

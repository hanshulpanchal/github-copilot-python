(function (root, factory) {
  const leaderboardApi = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = leaderboardApi;
  } else {
    root.SudokuLeaderboard = leaderboardApi;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const STORAGE_KEY = 'sudokuLeaderboard';
  const MAX_ENTRIES = 10;

  function isValidEntry(entry) {
    return entry &&
      typeof entry.playerName === 'string' &&
      entry.playerName.trim().length > 0 &&
      Number.isFinite(entry.completionTime) &&
      entry.completionTime >= 0 &&
      typeof entry.difficulty === 'string' &&
      Number.isInteger(entry.hintsUsed) &&
      entry.hintsUsed >= 0;
  }

  function sortEntries(entries) {
    return entries
      .filter(isValidEntry)
      .sort((left, right) => left.completionTime - right.completionTime)
      .slice(0, MAX_ENTRIES);
  }

  class Leaderboard {
    constructor(storage) {
      this.storage = storage === undefined
        ? (typeof localStorage === 'undefined' ? null : localStorage)
        : storage;
    }

    load() {
      if (!this.storage) return [];
      try {
        const stored = JSON.parse(this.storage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(stored) ? sortEntries(stored) : [];
      } catch (error) {
        return [];
      }
    }

    addEntry(entry) {
      const entries = sortEntries([...this.load(), entry]);
      if (!this.storage) return entries;
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (error) {
        return entries;
      }
      return entries;
    }
  }

  return {Leaderboard, MAX_ENTRIES, STORAGE_KEY, sortEntries};
});

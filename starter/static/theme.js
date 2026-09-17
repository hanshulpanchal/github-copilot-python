(function (root, factory) {
  const themeApi = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = themeApi;
  } else {
    root.SudokuTheme = themeApi;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const STORAGE_KEY = 'sudokuTheme';
  const LIGHT_THEME = 'light';
  const DARK_THEME = 'dark';

  function normalizeTheme(theme) {
    return theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
  }

  class ThemeManager {
    constructor(storage) {
      if (storage !== undefined) {
        this.storage = storage;
      } else {
        try {
          this.storage = typeof localStorage === 'undefined' ? null : localStorage;
        } catch (error) {
          this.storage = null;
        }
      }
      this.theme = LIGHT_THEME;
    }

    load() {
      if (!this.storage) {
        this.theme = LIGHT_THEME;
        return this.theme;
      }
      try {
        this.theme = normalizeTheme(this.storage.getItem(STORAGE_KEY));
      } catch (error) {
        this.theme = LIGHT_THEME;
      }
      return this.theme;
    }

    set(theme, rootElement) {
      this.theme = normalizeTheme(theme);
      if (this.storage) {
        try {
          this.storage.setItem(STORAGE_KEY, this.theme);
        } catch (error) {
          // The visual theme still changes when storage is unavailable.
        }
      }
      this.apply(rootElement);
      return this.theme;
    }

    toggle(rootElement) {
      return this.set(this.theme === DARK_THEME ? LIGHT_THEME : DARK_THEME, rootElement);
    }

    apply(rootElement) {
      rootElement.classList.toggle('dark-mode', this.theme === DARK_THEME);
      return this.theme;
    }
  }

  return {DARK_THEME, LIGHT_THEME, STORAGE_KEY, ThemeManager, normalizeTheme};
});

/**
 * theme-manager.js
 * Centralized theme management for both flashcard and prep apps
 * Handles light/dark theme switching and persistence
 */

const ThemeManager = (() => {
  const THEME_KEY = 'kcna-app-theme';
  const LIGHT = 'light';
  const DARK = 'dark';

  // Light theme (Flashcard app colors)
  const lightTheme = {
    '--bg-top': '#f7efe2',
    '--bg-bottom': '#dbe8f4',
    '--panel': 'rgba(255, 252, 247, 0.84)',
    '--panel-strong': 'rgba(255, 255, 255, 0.96)',
    '--text-main': '#1c2430',
    '--text-muted': '#5b6775',
    '--accent': '#0d7c66',
    '--accent-dark': '#085c4b',
    '--accent-soft': '#d9f1e8',
    '--danger': '#c23b3b',
    '--danger-soft': '#ffe8e6',
    '--border': 'rgba(28, 36, 48, 0.1)',
    '--shadow': '0 24px 70px rgba(28, 36, 48, 0.14)',
    // Prep app light theme equivalents
    '--primary': '#0d7c66',
    '--primary-dark': '#085c4b',
    '--secondary': '#0d7c66',
    '--bg-dark': '#f7efe2',
    '--bg-card': 'rgba(255, 252, 247, 0.84)',
    '--bg-card-hover': 'rgba(255, 255, 255, 0.96)',
    '--text-primary': '#1c2430',
    '--text-secondary': '#5b6775',
    '--border-color': 'rgba(28, 36, 48, 0.1)',
  };

  // Dark theme (Prep app colors)
  const darkTheme = {
    '--bg-top': '#1a1d29',
    '--bg-bottom': '#1a1d29',
    '--panel': 'rgba(36, 40, 55, 0.84)',
    '--panel-strong': 'rgba(36, 40, 55, 0.96)',
    '--text-main': '#ffffff',
    '--text-muted': '#a0a5b8',
    '--accent': '#326ce5',
    '--accent-dark': '#2857b8',
    '--accent-soft': 'rgba(50, 108, 229, 0.15)',
    '--danger': '#f87171',
    '--danger-soft': 'rgba(248, 113, 113, 0.15)',
    '--border': '#3d4259',
    '--shadow': '0 24px 70px rgba(0, 0, 0, 0.3)',
    // Prep app dark theme
    '--primary': '#326ce5',
    '--primary-dark': '#2857b8',
    '--secondary': '#00d4aa',
    '--bg-dark': '#1a1d29',
    '--bg-card': '#242837',
    '--bg-card-hover': '#2d3248',
    '--text-primary': '#ffffff',
    '--text-secondary': '#a0a5b8',
    '--border-color': '#3d4259',
  };

  function getSavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === LIGHT || saved === DARK) {
      return saved;
    }
    // Default to light theme
    return LIGHT;
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const vars = theme === DARK ? darkTheme : lightTheme;
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme);
    
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // For prep app's dynamic header gradient
    root.style.setProperty('--theme-color', vars['--primary']);
    root.style.setProperty('--theme-color-dark', vars['--primary-dark']);
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const newTheme = current === LIGHT ? DARK : LIGHT;
    setTheme(newTheme);
    return newTheme;
  }

  function setTheme(theme) {
    if (theme !== LIGHT && theme !== DARK) {
      console.warn(`Invalid theme: ${theme}. Using light.`);
      theme = LIGHT;
    }
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  }

  function initialize() {
    const theme = getSavedTheme();
    applyTheme(theme);
  }

  return {
    LIGHT,
    DARK,
    initialize,
    setTheme,
    toggleTheme,
    getSavedTheme,
    applyTheme,
  };
})();

// Initialize theme immediately on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.initialize();
  });
} else {
  ThemeManager.initialize();
}

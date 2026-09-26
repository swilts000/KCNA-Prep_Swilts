/**
 * theme-toggle.js
 * Creates and manages the theme toggle button UI
 * Oval button with sun/moon icons
 */

function createThemeToggle() {
  const toggle = document.createElement('button');
  toggle.id = 'theme-toggle';
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-label', 'Toggle between light and dark theme');
  toggle.setAttribute('title', 'Toggle theme (Light/Dark)');
  
  const currentTheme = ThemeManager.getSavedTheme();
  
  toggle.innerHTML = `
    <span class="theme-toggle-icon sun-icon" data-theme="light">☀️</span>
    <span class="theme-toggle-track"></span>
    <span class="theme-toggle-icon moon-icon" data-theme="dark">🌙</span>
  `;
  
  toggle.addEventListener('click', () => {
    const newTheme = ThemeManager.toggleTheme();
    updateToggleState(toggle, newTheme);
  });
  
  // Initialize toggle state
  updateToggleState(toggle, currentTheme);
  
  // Listen for theme changes from other instances
  window.addEventListener('theme-changed', (e) => {
    updateToggleState(toggle, e.detail.theme);
  });
  
  return toggle;
}

function updateToggleState(toggle, theme) {
  const sunIcon = toggle.querySelector('.sun-icon');
  const moonIcon = toggle.querySelector('.moon-icon');
  
  if (theme === ThemeManager.LIGHT) {
    toggle.dataset.theme = 'light';
    sunIcon.classList.add('active');
    moonIcon.classList.remove('active');
  } else {
    toggle.dataset.theme = 'dark';
    moonIcon.classList.add('active');
    sunIcon.classList.remove('active');
  }
}

function insertThemeToggle() {
  const toggle = createThemeToggle();
  
  // Fixed positioning for both apps (top-right like Chapter Lessons)
  toggle.style.position = 'fixed';
  toggle.style.top = '24px';
  toggle.style.right = '24px';
  toggle.style.zIndex = '1001';
  
  document.body.appendChild(toggle);
}

// Insert toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', insertThemeToggle);
} else {
  insertThemeToggle();
}

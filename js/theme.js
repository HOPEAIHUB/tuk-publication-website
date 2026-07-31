/* ============================================================
   TUK PUBLICATION – Theme Switcher
   Stores preference in HttpOnly + SameSite cookie (via server)
   and localStorage as fallback
   ============================================================ */

(function () {
  'use strict';

  const THEMES = ['light', 'dark', 'ultra'];
  const STORAGE_KEY = 'tuk-theme';
  const COOKIE_NAME = 'tuk_theme';

  function getStoredTheme() {
    // Try cookie first
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [name, value] = c.trim().split('=');
      if (name === COOKIE_NAME && THEMES.includes(value)) return value;
    }
    // Fall back to localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored)) return stored;
    return 'light';
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Set cookie (HttpOnly can't be set from JS, but SameSite can)
    document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Strict`;

    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  function initThemeSwitcher() {
    const stored = getStoredTheme();
    applyTheme(stored);

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        applyTheme(this.dataset.theme);
      });
    });

    // Keyboard shortcut: T to cycle themes
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 't' || e.key === 'T') {
        const current = getStoredTheme();
        const idx = THEMES.indexOf(current);
        const next = THEMES[(idx + 1) % THEMES.length];
        applyTheme(next);
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSwitcher);
  } else {
    initThemeSwitcher();
  }
})();

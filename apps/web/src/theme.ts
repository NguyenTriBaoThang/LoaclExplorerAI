import { useSyncExternalStore } from 'react'

// Initial theme is applied by the inline script in index.html (before first paint).
export type Theme = 'light' | 'dark'

const META_COLOR: Record<Theme, string> = { dark: '#064e3b', light: '#f6f3ec' }

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // storage blocked (private mode) — theme still applies for this session
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme])
  window.dispatchEvent(new Event('themechange'))
}

function subscribe(onChange: () => void) {
  window.addEventListener('themechange', onChange)
  return () => window.removeEventListener('themechange', onChange)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme)
}

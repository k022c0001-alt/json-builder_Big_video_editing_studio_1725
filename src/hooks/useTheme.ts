import { useState, useEffect, useCallback } from 'react'
import { type ThemeName, DEFAULT_THEME, applyTheme } from '../theme/themes'

const STORAGE_KEY = 'json-builder-theme'

function getStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['light', 'dark', 'rainbow', 'space', 'classroom'].includes(stored)) {
      return stored as ThemeName
    }
  } catch {
    // ignore
  }
  // Auto-detect system preference
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return DEFAULT_THEME
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = useCallback((newTheme: ThemeName) => {
    setTheme(newTheme)
  }, [])

  return { theme, toggleTheme }
}

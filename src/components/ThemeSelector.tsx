import React from 'react'
import { THEMES, type ThemeName } from '../theme/themes'
import styles from '../styles/editor.module.css'

interface ThemeSelectorProps {
  theme: ThemeName
  onThemeChange: (theme: ThemeName) => void
}

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className={styles.themeSelector} role="group" aria-label="Theme selector">
      {(Object.keys(THEMES) as ThemeName[]).map((key) => {
        const def = THEMES[key]
        const isActive = theme === key
        return (
          <button
            key={key}
            className={`${styles.themeBtn} ${isActive ? styles.themeBtnActive : ''}`}
            onClick={() => onThemeChange(key)}
            title={`${def.icon} ${def.label}`}
            aria-pressed={isActive}
            aria-label={`${def.label} theme`}
          >
            {def.icon}
          </button>
        )
      })}
    </div>
  )
}

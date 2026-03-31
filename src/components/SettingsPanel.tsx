import React, { useState, useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
import { ThemeSelector } from './ThemeSelector'
import { type AppSettings, settingsManager, type Language } from '../services/settingsManager'
import styles from '../styles/editor.module.css'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme()
  const [settings, setSettings] = useState<AppSettings>(() => settingsManager.load())

  const handleLanguageChange = useCallback((lang: Language) => {
    const next = { ...settings, language: lang }
    setSettings(next)
    settingsManager.save(next)
  }, [settings])

  const handleAutoSaveChange = useCallback((ms: number) => {
    const next = { ...settings, autoSaveIntervalMs: ms }
    setSettings(next)
    settingsManager.save(next)
  }, [settings])

  const handleFontSizeChange = useCallback((size: number) => {
    const next = { ...settings, fontSize: size }
    setSettings(next)
    settingsManager.save(next)
    document.documentElement.style.setProperty('--font-size-base', `${size}px`)
  }, [settings])

  return (
    <div className={styles.settingsOverlay} role="dialog" aria-label="Settings" aria-modal="true">
      <div className={styles.settingsPanel}>
        <div className={styles.settingsHeader}>
          <h2 className={styles.settingsTitle}>⚙️ Settings</h2>
          <button className={styles.errorCloseBtn} onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className={styles.settingsBody}>
          {/* Theme */}
          <section className={styles.settingsSection}>
            <label className={styles.settingsLabel}>Theme</label>
            <ThemeSelector theme={theme} onThemeChange={toggleTheme} />
          </section>

          {/* Language */}
          <section className={styles.settingsSection}>
            <label className={styles.settingsLabel}>Language / 言語</label>
            <div className={styles.settingsBtnGroup}>
              <button
                className={`${styles.settingsOptionBtn} ${settings.language === 'ja' ? styles.settingsOptionBtnActive : ''}`}
                onClick={() => handleLanguageChange('ja')}
              >
                🇯🇵 日本語
              </button>
              <button
                className={`${styles.settingsOptionBtn} ${settings.language === 'en' ? styles.settingsOptionBtnActive : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                🇺🇸 English
              </button>
            </div>
          </section>

          {/* Auto-save */}
          <section className={styles.settingsSection}>
            <label className={styles.settingsLabel}>
              Auto-save interval
              <span className={styles.settingsMuted}>
                {settings.autoSaveIntervalMs === 0 ? ' (disabled)' : ` (${settings.autoSaveIntervalMs / 1000}s)`}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={60000}
              step={5000}
              value={settings.autoSaveIntervalMs}
              onChange={(e) => handleAutoSaveChange(Number(e.target.value))}
              className={styles.settingsRange}
            />
          </section>

          {/* Font size */}
          <section className={styles.settingsSection}>
            <label className={styles.settingsLabel}>
              Font size: <strong>{settings.fontSize}px</strong>
            </label>
            <input
              type="range"
              min={10}
              max={20}
              step={1}
              value={settings.fontSize}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              className={styles.settingsRange}
            />
          </section>
        </div>
      </div>
    </div>
  )
}

export type Language = 'ja' | 'en'

export interface AppSettings {
  language: Language
  autoSaveIntervalMs: number
  fontSize: number
}

const STORAGE_KEY = 'json-builder-settings'

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ja',
  autoSaveIntervalMs: 0,
  fontSize: 13,
}

export const settingsManager = {
  load(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_SETTINGS }
  },

  save(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  },

  getDefault(): AppSettings {
    return { ...DEFAULT_SETTINGS }
  },
}

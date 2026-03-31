export interface ElectronAPI {
  saveJsonFile(json: string, filename: string): Promise<boolean>
  saveJsonFileAs?(json: string, defaultPath?: string): Promise<string | null>
  openJsonFile?(): Promise<{ content: string; filePath: string } | null>
  copyToClipboard(text: string): Promise<boolean>
  getRecentFiles?(): Promise<string[]>
  addRecentFile?(filePath: string): Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export const electronApi = {
  /**
   * Save JSON content to a file via Electron's save dialog.
   * Falls back to a browser download when running outside Electron.
   */
  saveJsonFile: async (json: string, filename = 'output.json'): Promise<boolean> => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.saveJsonFile(json, filename)
    }
    // Browser fallback
    try {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Copy text to the system clipboard.
   * Falls back to navigator.clipboard when running outside Electron.
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    if (isElectron && window.electronAPI) {
      return window.electronAPI.copyToClipboard(text)
    }
    // Browser fallback
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  },
}

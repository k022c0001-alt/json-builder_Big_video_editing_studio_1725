import type { Project } from '../../shared/parser/types'
// ElectronAPI and window.electronAPI are declared in electronApi.ts

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

/**
 * Open a JSON file via Electron's open dialog (or browser file input).
 * Returns the parsed Project and file path, or null if cancelled.
 */
export async function openJsonFile(): Promise<{ project: Project; filePath: string } | null> {
  if (isElectron && window.electronAPI?.openJsonFile) {
    const result = await window.electronAPI.openJsonFile()
    if (!result) return null
    try {
      const raw = JSON.parse(result.content)
      const project: Project = {
        id: raw.id ?? Math.random().toString(36).slice(2, 10),
        name: raw.name ?? 'Imported',
        data: raw.data ?? (({ id: _id, name: _n, createdAt: _c, updatedAt: _u, ...rest }) => rest)(raw),
        createdAt: raw.createdAt ?? new Date().toISOString(),
        updatedAt: raw.updatedAt ?? new Date().toISOString(),
      }
      return { project, filePath: result.filePath }
    } catch {
      return null
    }
  }
  // Browser fallback: trigger file input
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const raw = JSON.parse(reader.result as string)
          const project: Project = {
            id: raw.id ?? Math.random().toString(36).slice(2, 10),
            name: raw.name ?? file.name.replace(/\.json$/i, ''),
            data: raw.data ?? (({ id: _id, name: _n, createdAt: _c, updatedAt: _u, ...rest }) => rest)(raw),
            createdAt: raw.createdAt ?? new Date().toISOString(),
            updatedAt: raw.updatedAt ?? new Date().toISOString(),
          }
          resolve({ project, filePath: file.name })
        } catch {
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.click()
  })
}

/**
 * Save a Project to a JSON file, returning true on success.
 */
export async function saveJsonFile(project: Project, filePath?: string): Promise<boolean> {
  const json = JSON.stringify(project, null, 2)
  const filename = filePath ?? `${project.name}.json`

  if (isElectron && window.electronAPI?.saveJsonFile) {
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
}

/**
 * Save a Project with a "Save As" dialog, returning the chosen file path or null.
 */
export async function saveAsJsonFile(project: Project): Promise<string | null> {
  const json = JSON.stringify(project, null, 2)
  const defaultPath = `${project.name}.json`

  if (isElectron && window.electronAPI?.saveJsonFileAs) {
    return window.electronAPI.saveJsonFileAs(json, defaultPath)
  }
  // Browser: same as regular save
  try {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultPath
    a.click()
    URL.revokeObjectURL(url)
    return defaultPath
  } catch {
    return null
  }
}

/**
 * Returns the list of recently opened file paths.
 */
export async function getRecentFiles(): Promise<string[]> {
  if (isElectron && window.electronAPI?.getRecentFiles) {
    return window.electronAPI.getRecentFiles()
  }
  try {
    const raw = localStorage.getItem('json-builder-recent-files')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const fileManager = { openJsonFile, saveJsonFile, saveAsJsonFile, getRecentFiles }

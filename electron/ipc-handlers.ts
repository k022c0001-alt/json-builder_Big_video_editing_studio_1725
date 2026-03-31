import { ipcMain, dialog, clipboard } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

const recentFiles: string[] = []
const MAX_RECENT = 10

function addRecentFile(filePath: string): void {
  const idx = recentFiles.indexOf(filePath)
  if (idx !== -1) recentFiles.splice(idx, 1)
  recentFiles.unshift(filePath)
  if (recentFiles.length > MAX_RECENT) recentFiles.length = MAX_RECENT
}

export function registerIpcHandlers(): void {
  // Save JSON file (with save dialog)
  ipcMain.handle('save-json-file', async (_event, json: string, filename: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: filename || 'output.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })
    if (canceled || !filePath) return false
    try {
      fs.writeFileSync(filePath, json, 'utf-8')
      addRecentFile(filePath)
      return true
    } catch {
      return false
    }
  })

  // Save JSON file with path returned (Save As)
  ipcMain.handle('save-json-file-as', async (_event, json: string, defaultPath?: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: defaultPath || 'output.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })
    if (canceled || !filePath) return null
    try {
      fs.writeFileSync(filePath, json, 'utf-8')
      addRecentFile(filePath)
      return filePath
    } catch {
      return null
    }
  })

  // Open JSON file
  ipcMain.handle('open-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (canceled || filePaths.length === 0) return null
    const filePath = filePaths[0]
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      addRecentFile(filePath)
      return { content, filePath }
    } catch {
      return null
    }
  })

  // Copy to clipboard
  ipcMain.handle('copy-to-clipboard', async (_event, text: string) => {
    try {
      clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  })

  // Get recent files list
  ipcMain.handle('get-recent-files', async () => {
    return recentFiles.filter((f) => fs.existsSync(f))
  })
}

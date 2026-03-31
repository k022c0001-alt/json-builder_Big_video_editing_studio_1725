import { app, BrowserWindow, ipcMain, dialog, clipboard } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

const isDev = process.env.NODE_ENV === 'development'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('save-json-file', async (_event, json: string, filename: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: filename || 'output.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  })
  if (canceled || !filePath) return false
  try {
    fs.writeFileSync(filePath, json, 'utf-8')
    return true
  } catch {
    return false
  }
})

ipcMain.handle('copy-to-clipboard', async (_event, text: string) => {
  try {
    clipboard.writeText(text)
    return true
  } catch {
    return false
  }
})

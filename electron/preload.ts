import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveJsonFile: (json: string, filename: string): Promise<boolean> =>
    ipcRenderer.invoke('save-json-file', json, filename),

  saveJsonFileAs: (json: string, defaultPath?: string): Promise<string | null> =>
    ipcRenderer.invoke('save-json-file-as', json, defaultPath),

  openJsonFile: (): Promise<{ content: string; filePath: string } | null> =>
    ipcRenderer.invoke('open-file'),

  copyToClipboard: (text: string): Promise<boolean> =>
    ipcRenderer.invoke('copy-to-clipboard', text),

  getRecentFiles: (): Promise<string[]> =>
    ipcRenderer.invoke('get-recent-files'),
})

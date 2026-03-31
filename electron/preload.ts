import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveJsonFile: (json: string, filename: string): Promise<boolean> =>
    ipcRenderer.invoke('save-json-file', json, filename),

  copyToClipboard: (text: string): Promise<boolean> =>
    ipcRenderer.invoke('copy-to-clipboard', text),
})

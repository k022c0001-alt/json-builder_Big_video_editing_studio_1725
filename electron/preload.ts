// electron/preload.ts
// Preload script – runs in the renderer context with limited Node.js access.
// Use contextBridge to expose safe APIs to the renderer if needed.

import { contextBridge } from "electron";

// Expose application version to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
});

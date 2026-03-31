import React, { useState, useCallback } from 'react'
import { useProjectStore } from 'shared/store/project.store'
import { fileManager } from '../services/fileManager'
import { EDITOR_CONFIG } from '../constants/editor'
import styles from '../styles/editor.module.css'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

let toastIdSeq = 0

interface FileMenuProps {
  onProjectLoaded?: () => void
}

export function FileMenu({ onProjectLoaded }: FileMenuProps) {
  const project = useProjectStore((s) => s.project)
  const loadProject = useProjectStore((s) => s.loadProject)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdSeq
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, EDITOR_CONFIG.TOAST_DURATION_MS)
  }, [])

  const handleOpen = useCallback(async () => {
    setMenuOpen(false)
    const result = await fileManager.openJsonFile()
    if (!result) {
      addToast('❌ Open cancelled or file is invalid.', 'error')
      return
    }
    loadProject(result.project, [])
    addToast(`📂 Opened: ${result.filePath}`, 'success')
    onProjectLoaded?.()
  }, [loadProject, addToast, onProjectLoaded])

  const handleSave = useCallback(async () => {
    setMenuOpen(false)
    if (!project) { addToast('No project to save.', 'error'); return }
    const ok = await fileManager.saveJsonFile(project)
    addToast(ok ? '📥 Saved.' : '❌ Save failed.', ok ? 'success' : 'error')
  }, [project, addToast])

  const handleSaveAs = useCallback(async () => {
    setMenuOpen(false)
    if (!project) { addToast('No project to save.', 'error'); return }
    const path = await fileManager.saveAsJsonFile(project)
    addToast(path ? `📥 Saved as: ${path}` : '❌ Save As cancelled.', path ? 'success' : 'error')
  }, [project, addToast])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        handleOpen()
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault()
        handleSaveAs()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    },
    [handleOpen, handleSave, handleSaveAs],
  )

  return (
    <>
      <div className={styles.fileMenuWrapper} onKeyDown={handleKeyDown}>
        <button
          className={styles.exportBtn}
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          📁 File
        </button>

        {menuOpen && (
          <div
            className={styles.dropdownMenu}
            role="menu"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button role="menuitem" className={styles.menuItem} onClick={handleOpen}>
              📂 Open… <kbd>Ctrl+O</kbd>
            </button>
            <button role="menuitem" className={styles.menuItem} onClick={handleSave}>
              📥 Save <kbd>Ctrl+S</kbd>
            </button>
            <button role="menuitem" className={styles.menuItem} onClick={handleSaveAs}>
              💾 Save As… <kbd>Ctrl+Shift+S</kbd>
            </button>
          </div>
        )}
      </div>

      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`${styles.toast} ${
                t.type === 'success' ? styles.toastSuccess : styles.toastError
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

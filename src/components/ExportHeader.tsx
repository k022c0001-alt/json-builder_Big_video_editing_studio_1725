import React, { useState, useCallback } from 'react'
import { useProjectStore } from 'shared/store/project.store'
import { electronApi } from '../services/electronApi'
import { EDITOR_CONFIG } from '../constants/editor'
import styles from '../styles/editor.module.css'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

let toastIdSeq = 0

export function ExportHeader() {
  const project = useProjectStore((s) => s.project)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdSeq
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, EDITOR_CONFIG.TOAST_DURATION_MS)
  }, [])

  const getJsonString = useCallback((): string | null => {
    if (!project) return null
    const output = { name: project.name, ...project.data }
    return JSON.stringify(output, null, 2)
  }, [project])

  const handleSave = useCallback(async () => {
    const json = getJsonString()
    if (!json) {
      addToast('No project to save.', 'error')
      return
    }
    const filename = `${project?.name ?? 'output'}.json`
    const ok = await electronApi.saveJsonFile(json, filename)
    addToast(ok ? '📥 Saved to file.' : '❌ Save cancelled.', ok ? 'success' : 'error')
  }, [getJsonString, addToast, project])

  const handleCopy = useCallback(async () => {
    const json = getJsonString()
    if (!json) {
      addToast('No project to copy.', 'error')
      return
    }
    const ok = await electronApi.copyToClipboard(json)
    addToast(ok ? '📋 Copied to clipboard!' : '❌ Copy failed.', ok ? 'success' : 'error')
  }, [getJsonString, addToast])

  return (
    <>
      <div className={styles.exportHeader}>
        <button className={styles.exportBtn} onClick={handleSave} title="Save JSON to file">
          📥 <span className={styles.exportBtnLabel}>Save to File</span>
        </button>
        <button className={styles.exportBtn} onClick={handleCopy} title="Copy JSON to clipboard">
          📋 <span className={styles.exportBtnLabel}>Copy to Clipboard</span>
        </button>
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

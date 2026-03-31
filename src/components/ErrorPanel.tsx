import React from 'react'
import { useProjectStore } from 'shared/store/project.store'
import { EDITOR_CONFIG } from '../constants/editor'
import styles from '../styles/editor.module.css'

interface ErrorPanelProps {
  onClose: () => void
}

export function ErrorPanel({ onClose }: ErrorPanelProps) {
  const errors = useProjectStore((s) => s.parserErrors)

  if (errors.length === 0) return null

  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warnCount = errors.filter((e) => e.severity === 'warning').length

  return (
    <div
      className={styles.errorPanel}
      style={{ maxHeight: EDITOR_CONFIG.ERROR_PANEL_MAX_HEIGHT }}
    >
      <div className={styles.errorHeader}>
        <span>
          {errorCount > 0 && `${errorCount} error${errorCount > 1 ? 's' : ''}`}
          {errorCount > 0 && warnCount > 0 && ', '}
          {warnCount > 0 && `${warnCount} warning${warnCount > 1 ? 's' : ''}`}
        </span>
        <button className={styles.errorCloseBtn} onClick={onClose} aria-label="Close error panel">
          ×
        </button>
      </div>
      <ul className={styles.errorList}>
        {errors.map((err, idx) => (
          <li
            key={idx}
            className={`${styles.errorItem} ${
              err.severity === 'error' ? styles.errorItemError : styles.errorItemWarning
            }`}
          >
            <span>
              {err.severity === 'error' ? '✖' : '⚠'}{' '}
              {err.line !== undefined ? `Line ${err.line}: ` : ''}
              {err.message}
            </span>
            {err.suggestion && (
              <span className={styles.errorSuggestion}>— {err.suggestion}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

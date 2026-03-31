import React, { useState, useEffect, useRef } from 'react'
import styles from '../styles/modals.module.css'

export type ModalType = 'keyValue' | 'section' | 'array' | 'jsonBlock' | 'comment'

interface DataAddModalProps {
  type: ModalType
  onConfirm: (data: ModalResult) => void
  onCancel: () => void
}

export interface ModalResult {
  type: ModalType
  key?: string
  value?: string
  sectionName?: string
  items?: string[]
  jsonStr?: string
  comment?: string
}

const TITLES: Record<ModalType, string> = {
  keyValue: '➕ Add Key-Value',
  section: '➕ Add Section',
  array: '➕ Add Array',
  jsonBlock: '➕ Add JSON Block',
  comment: '➕ Add Comment',
}

export function DataAddModal({ type, onConfirm, onCancel }: DataAddModalProps) {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [itemsText, setItemsText] = useState('')
  const [jsonStr, setJsonStr] = useState('{\n  \n}')
  const [comment, setComment] = useState('')

  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // Auto-focus the first input field
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus()
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const isValid = () => {
    if (type === 'keyValue') return key.trim().length > 0 && value.trim().length > 0
    if (type === 'section') return sectionName.trim().length > 0
    if (type === 'array') return itemsText.trim().length > 0
    if (type === 'jsonBlock') {
      try {
        JSON.parse(jsonStr)
        return true
      } catch {
        return false
      }
    }
    if (type === 'comment') return comment.trim().length > 0
    return false
  }

  const handleSubmit = () => {
    if (!isValid()) return
    const items = itemsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onConfirm({ type, key, value, sectionName, items, jsonStr, comment })
  }

  const SINGLE_LINE_SUBMIT_TYPES: ModalType[] = ['keyValue', 'section', 'comment']

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && SINGLE_LINE_SUBMIT_TYPES.includes(type)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>{TITLES[type]}</h2>
          <button
            className={styles.dialogCloseBtn}
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className={styles.dialogBody}>
          {type === 'keyValue' && (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Key</label>
                <input
                  ref={firstInputRef as React.RefObject<HTMLInputElement>}
                  className={styles.fieldInput}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. host"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Value</label>
                <input
                  className={styles.fieldInput}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. localhost"
                />
              </div>
            </>
          )}

          {type === 'section' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Section Name</label>
              <input
                ref={firstInputRef as React.RefObject<HTMLInputElement>}
                className={styles.fieldInput}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Database"
              />
            </div>
          )}

          {type === 'array' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Items (comma-separated)</label>
              <input
                ref={firstInputRef as React.RefObject<HTMLInputElement>}
                className={styles.fieldInput}
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. item1, item2, item3"
              />
            </div>
          )}

          {type === 'jsonBlock' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>JSON Content</label>
              <textarea
                ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
                className={`${styles.fieldInput} ${styles.fieldTextarea}`}
                value={jsonStr}
                onChange={(e) => setJsonStr(e.target.value)}
                placeholder='{\n  "key": "value"\n}'
                rows={5}
              />
            </div>
          )}

          {type === 'comment' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Comment Text</label>
              <input
                ref={firstInputRef as React.RefObject<HTMLInputElement>}
                className={styles.fieldInput}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. My Project"
              />
            </div>
          )}
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.btnCancel} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.btnOk} onClick={handleSubmit} disabled={!isValid()}>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

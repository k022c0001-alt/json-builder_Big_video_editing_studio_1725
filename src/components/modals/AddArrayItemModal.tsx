import React, { useState } from 'react'
import styles from '../../styles/adddata.module.css'

interface Props {
  onAdd: (arrayName: string, item: string) => void
  onClose: () => void
}

export function AddArrayItemModal({ onAdd, onClose }: Props) {
  const [arrayName, setArrayName] = useState('')
  const [item, setItem] = useState('')

  const handleAdd = () => {
    if (!arrayName.trim()) return
    onAdd(arrayName.trim(), item.trim())
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add Array Item</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Array Name</label>
            <input
              className={styles.formInput}
              value={arrayName}
              onChange={(e) => setArrayName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. tags"
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Item Value</label>
            <input
              className={styles.formInput}
              value={item}
              onChange={(e) => setItem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. production"
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={handleAdd} disabled={!arrayName.trim()}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

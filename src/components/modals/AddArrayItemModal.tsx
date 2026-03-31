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

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add Array Item</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Array Name</label>
            <input
              className={styles.formInput}
              placeholder="e.g. tags"
              value={arrayName}
              onChange={(e) => setArrayName(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Item Value</label>
            <input
              className={styles.formInput}
              placeholder="e.g. admin"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleAdd} disabled={!arrayName.trim()}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

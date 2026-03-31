import React, { useState } from 'react'
import styles from '../../styles/adddata.module.css'

interface Props {
  onAdd: (name: string, level: number) => void
  onClose: () => void
}

export function AddSectionModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState(2)

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim(), level)
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add Section</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Section Name</label>
            <input
              className={styles.formInput}
              placeholder="e.g. Database"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Level</label>
            <select
              className={styles.formSelect}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              <option value={1}># (Main)</option>
              <option value={2}>## (Sub)</option>
              <option value={3}>### (SubSub)</option>
            </select>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleAdd} disabled={!name.trim()}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

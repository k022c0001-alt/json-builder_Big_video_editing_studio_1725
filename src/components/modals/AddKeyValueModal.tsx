import React, { useState } from 'react'
import styles from '../../styles/adddata.module.css'

interface Props {
  onAdd: (key: string, value: string, type: string) => void
  onClose: () => void
}

export function AddKeyValueModal({ onAdd, onClose }: Props) {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState('string')

  const handleAdd = () => {
    if (!key.trim()) return
    onAdd(key.trim(), value.trim(), type)
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add Key-Value Pair</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Key</label>
            <input
              className={styles.formInput}
              placeholder="e.g. host"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Value</label>
            <input
              className={styles.formInput}
              placeholder="e.g. localhost"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Type</label>
            <select
              className={styles.formSelect}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean_true">Boolean (true)</option>
              <option value="boolean_false">Boolean (false)</option>
              <option value="null">null</option>
            </select>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleAdd} disabled={!key.trim()}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

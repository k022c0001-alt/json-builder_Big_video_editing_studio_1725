import React, { useState } from 'react'
import { TEMPLATE_LABELS } from '../../constants/templates'
import styles from '../../styles/adddata.module.css'

const TEMPLATE_ICONS: Record<string, string> = {
  database: '🗄️',
  api: '🔌',
  userProfile: '👤',
  settings: '⚙️',
}

interface Props {
  onInsert: (templateKey: string) => void
  onClose: () => void
}

export function TemplatePickerModal({ onInsert, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleInsert = () => {
    if (!selected) return
    onInsert(selected)
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Select Template</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.templateList}>
            {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.templateOption} ${selected === key ? styles.templateOptionSelected : ''}`}
                onClick={() => setSelected(key)}
              >
                <span className={styles.templateIcon}>{TEMPLATE_ICONS[key]}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={handleInsert} disabled={!selected}>
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { TEMPLATE_LIST } from '../../constants/templates'
import styles from '../../styles/adddata.module.css'

interface Props {
  onInsert: (templateKey: string) => void
  onClose: () => void
}

const TEMPLATE_ICONS: Record<string, string> = {
  databaseConfig: '🗄️',
  apiEndpoint: '🔌',
  userProfile: '👤',
  settings: '⚙️',
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
          <h3 className={styles.modalTitle}>Select Template</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.templateList}>
            {TEMPLATE_LIST.map((tpl) => (
              <button
                key={tpl.key}
                className={`${styles.templateItem} ${selected === tpl.key ? styles.templateItemSelected : ''}`}
                onClick={() => setSelected(tpl.key)}
              >
                <span>{TEMPLATE_ICONS[tpl.key] ?? '📄'}</span>
                <span>{tpl.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleInsert} disabled={!selected}>
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}

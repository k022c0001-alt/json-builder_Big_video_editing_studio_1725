import React from 'react'
import { TEMPLATE_LIST } from '../constants/templates'
import { useAddData } from '../hooks/useAddData'
import styles from '../styles/adddata.module.css'

const TEMPLATE_ICONS: Record<string, string> = {
  databaseConfig: '🗄️',
  apiEndpoint: '🔌',
  userProfile: '👤',
  settings: '⚙️',
}

export function TemplateSelector() {
  const { insertTemplate } = useAddData()

  return (
    <div className={styles.templateSelector}>
      <p className={styles.templateSelectorTitle}>📚 Quick Templates</p>
      <div className={styles.templateGrid}>
        {TEMPLATE_LIST.map((tpl) => (
          <button
            key={tpl.key}
            className={styles.templateCard}
            onClick={() => insertTemplate(tpl.key)}
            title={`Insert "${tpl.label}" template`}
          >
            <span className={styles.templateCardIcon}>{TEMPLATE_ICONS[tpl.key] ?? '📄'}</span>
            <span className={styles.templateCardLabel}>{tpl.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

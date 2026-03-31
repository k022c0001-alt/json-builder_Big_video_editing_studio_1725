import React from 'react'
import { TEMPLATES, TEMPLATE_LABELS } from '../constants/templates'
import { useProjectStore } from 'shared/store/project.store'
import styles from '../styles/adddata.module.css'

const TEMPLATE_ICONS: Record<string, string> = {
  database: '🗄️',
  api: '🔌',
  userProfile: '👤',
  settings: '⚙️',
}

export function TemplateSelector() {
  const setMemoText = useProjectStore((s) => s.setMemoText)

  const handleSelect = (key: string) => {
    const template = TEMPLATES[key]
    if (template) {
      setMemoText(template)
    }
  }

  return (
    <div className={styles.templateList}>
      {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
        <button
          key={key}
          className={styles.templateOption}
          onClick={() => handleSelect(key)}
          title={`Insert ${label} template`}
        >
          <span className={styles.templateIcon}>{TEMPLATE_ICONS[key]}</span>
          {label}
        </button>
      ))}
    </div>
  )
}

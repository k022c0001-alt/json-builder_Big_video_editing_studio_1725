import React from 'react'
import { TEMPLATES, TemplateInfo } from '../utils/templates'
import { useProjectStore } from 'shared/store/project.store'
import styles from '../styles/buttons.module.css'

interface TemplateSelectorProps {
  /** Called after a template has been applied. */
  onSelect?: (template: TemplateInfo) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const replaceText = useProjectStore((s) => s.replaceText)

  const handleSelect = (template: TemplateInfo) => {
    replaceText(template.content)
    onSelect?.(template)
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}
      role="toolbar"
      aria-label="Template selector"
    >
      {TEMPLATES.map((tpl) => (
        <button
          key={tpl.key}
          className={styles.addBtn}
          onClick={() => handleSelect(tpl)}
          title={tpl.description}
          aria-label={`Apply template: ${tpl.label}`}
        >
          {tpl.icon} {tpl.label}
        </button>
      ))}
    </div>
  )
}

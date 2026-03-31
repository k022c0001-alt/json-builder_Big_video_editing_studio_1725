import React from 'react'
import { useProjectStore } from 'shared/store/project.store'
import { JsonTreeView } from './JsonTreeView'
import styles from '../styles/editor.module.css'

export function JsonPreview() {
  const project = useProjectStore((s) => s.project)
  const errors = useProjectStore((s) => s.parserErrors)

  const hasErrors = errors.some((e) => e.severity === 'error')

  if (!project || hasErrors) {
    return (
      <div className={styles.jsonScrollArea}>
        {hasErrors ? (
          <p style={{ color: '#888', fontSize: 13, fontFamily: 'monospace' }}>
            JSON preview unavailable — fix errors to see output.
          </p>
        ) : (
          <p style={{ color: '#888', fontSize: 13, fontFamily: 'monospace' }}>
            Start typing in the editor to see JSON preview.
          </p>
        )}
      </div>
    )
  }

  const jsonData = { name: project.name, ...project.data }

  return (
    <div className={styles.jsonScrollArea}>
      <ul className={styles.jsonTree}>
        <JsonTreeView data={jsonData} />
      </ul>
    </div>
  )
}

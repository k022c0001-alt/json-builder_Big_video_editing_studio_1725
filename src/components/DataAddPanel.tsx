import React, { useState } from 'react'
import { DataAddModal, ModalType, ModalResult } from './DataAddModal'
import { useDataAddition } from '../hooks/useDataAddition'
import styles from '../styles/buttons.module.css'

interface DataAddPanelProps {
  /** When true the buttons are rendered inline (toolbar row style). */
  inline?: boolean
}

const BUTTONS: { type: ModalType; label: string; title: string }[] = [
  { type: 'keyValue', label: '➕ Key-Value', title: 'Add a key: value pair' },
  { type: 'section', label: '➕ Section', title: 'Add a ## Section heading' },
  { type: 'array', label: '➕ Array', title: 'Add a - item1, item2 list' },
  { type: 'jsonBlock', label: '➕ JSON Block', title: 'Add a ```json block' },
  { type: 'comment', label: '➕ Comment', title: 'Add a # comment line' },
]

export function DataAddPanel({ inline = true }: DataAddPanelProps) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null)
  const { insertKeyValue, insertSection, insertArray, insertJsonBlock, insertComment } =
    useDataAddition()

  const handleConfirm = (result: ModalResult) => {
    switch (result.type) {
      case 'keyValue':
        if (result.key && result.value !== undefined) {
          insertKeyValue(result.key, result.value)
        }
        break
      case 'section':
        if (result.sectionName) {
          insertSection(result.sectionName)
        }
        break
      case 'array':
        if (result.items) {
          insertArray(result.items)
        }
        break
      case 'jsonBlock':
        if (result.jsonStr) {
          insertJsonBlock(result.jsonStr)
        }
        break
      case 'comment':
        if (result.comment) {
          insertComment(result.comment)
        }
        break
    }
    setActiveModal(null)
  }

  return (
    <>
      <div
        style={
          inline
            ? { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }
            : { display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px' }
        }
        role="toolbar"
        aria-label="Add data buttons"
      >
        {BUTTONS.map((btn) => (
          <button
            key={btn.type}
            className={styles.addBtn}
            onClick={() => setActiveModal(btn.type)}
            title={btn.title}
            aria-label={btn.title}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {activeModal && (
        <DataAddModal
          type={activeModal}
          onConfirm={handleConfirm}
          onCancel={() => setActiveModal(null)}
        />
      )}
    </>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { useAddData } from '../hooks/useAddData'
import { AddKeyValueModal } from './modals/AddKeyValueModal'
import { AddSectionModal } from './modals/AddSectionModal'
import { AddArrayItemModal } from './modals/AddArrayItemModal'
import { TemplatePickerModal } from './modals/TemplatePickerModal'
import styles from '../styles/adddata.module.css'

type ModalType = 'keyValue' | 'section' | 'arrayItem' | 'template' | null

export function AddDataPanel() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { addKeyValue, addSection, addArrayItem, insertTemplate } = useAddData()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openModal = (type: ModalType) => {
    setDropdownOpen(false)
    setModal(type)
  }

  return (
    <>
      <div className={styles.addWrapper} ref={wrapperRef}>
        <button
          className={`${styles.addBtn} ${dropdownOpen ? styles.addBtnActive : ''}`}
          onClick={() => setDropdownOpen((v) => !v)}
          title="Add data to editor"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          ➕ Add ▾
        </button>

        {dropdownOpen && (
          <div className={styles.dropdownMenu} role="menu">
            <button className={styles.dropdownItem} onClick={() => openModal('keyValue')} role="menuitem">
              ➕ Key-Value Pair
            </button>
            <button className={styles.dropdownItem} onClick={() => openModal('section')} role="menuitem">
              ➕ Section (Heading)
            </button>
            <button className={styles.dropdownItem} onClick={() => openModal('arrayItem')} role="menuitem">
              ➕ Array Item
            </button>
            <div className={styles.dropdownDivider} />
            <button className={styles.dropdownItem} onClick={() => openModal('template')} role="menuitem">
              📋 From Template
            </button>
          </div>
        )}
      </div>

      {modal === 'keyValue' && (
        <AddKeyValueModal
          onAdd={addKeyValue}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'section' && (
        <AddSectionModal
          onAdd={addSection}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'arrayItem' && (
        <AddArrayItemModal
          onAdd={addArrayItem}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'template' && (
        <TemplatePickerModal
          onInsert={insertTemplate}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

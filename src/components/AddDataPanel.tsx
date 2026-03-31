import React, { useState, useEffect, useRef } from 'react'
import { useAddData } from '../hooks/useAddData'
import { AddKeyValueModal } from './modals/AddKeyValueModal'
import { AddSectionModal } from './modals/AddSectionModal'
import { AddArrayItemModal } from './modals/AddArrayItemModal'
import { TemplatePickerModal } from './modals/TemplatePickerModal'
import addStyles from '../styles/adddata.module.css'
import editorStyles from '../styles/editor.module.css'

type ModalType = 'keyvalue' | 'section' | 'array' | 'template' | null

export function AddDataPanel() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)
  const { addKeyValue, addSection, addArrayItem, insertTemplate } = useAddData()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const openModal = (type: ModalType) => {
    setDropdownOpen(false)
    setModal(type)
  }

  return (
    <>
      <div className={addStyles.addDropdownWrapper} ref={wrapperRef}>
        <button
          className={editorStyles.exportBtn}
          onClick={() => setDropdownOpen((v) => !v)}
          title="Add data to editor"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          ➕ <span className={editorStyles.exportBtnLabel}>Add ▾</span>
        </button>

        {dropdownOpen && (
          <div className={addStyles.addDropdownMenu} role="menu">
            <button className={addStyles.addDropdownItem} role="menuitem" onClick={() => openModal('keyvalue')}>
              ➕ Key-Value Pair
            </button>
            <button className={addStyles.addDropdownItem} role="menuitem" onClick={() => openModal('section')}>
              ➕ Section (見出し)
            </button>
            <button className={addStyles.addDropdownItem} role="menuitem" onClick={() => openModal('array')}>
              ➕ Array Item
            </button>
            <button className={addStyles.addDropdownItem} role="menuitem" onClick={() => openModal('template')}>
              ➕ From Template
            </button>
          </div>
        )}
      </div>

      {modal === 'keyvalue' && (
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
      {modal === 'array' && (
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

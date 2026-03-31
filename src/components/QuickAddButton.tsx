import React, { useState, useEffect, useRef } from 'react'
import { DataAddModal, ModalType, ModalResult } from './DataAddModal'
import { useDataAddition } from '../hooks/useDataAddition'
import styles from '../styles/buttons.module.css'

const MENU_ITEMS: { type: ModalType; label: string; icon: string }[] = [
  { type: 'keyValue', icon: '🔑', label: 'Key-Value' },
  { type: 'section', icon: '📂', label: 'Section' },
  { type: 'array', icon: '📋', label: 'Array' },
  { type: 'jsonBlock', icon: '📦', label: 'JSON Block' },
  { type: 'comment', icon: '💬', label: 'Comment' },
]

/**
 * A floating action button (bottom-right) that opens a quick-add menu.
 */
export function QuickAddButton() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<ModalType | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { insertKeyValue, insertSection, insertArray, insertJsonBlock, insertComment } =
    useDataAddition()

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleMenuClick = (type: ModalType) => {
    setMenuOpen(false)
    setActiveModal(type)
  }

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
      <div ref={menuRef}>
        {menuOpen && (
          <div className={styles.floatingMenu} role="menu">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.type}
                className={styles.floatingMenuItem}
                onClick={() => handleMenuClick(item.type)}
                role="menuitem"
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
        <button
          className={styles.floatingBtn}
          onClick={() => setMenuOpen((v) => !v)}
          title="Add data to editor"
          aria-label="Open add data menu"
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          ➕
        </button>
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

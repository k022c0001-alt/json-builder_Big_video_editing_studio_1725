import React, { useCallback, useRef } from 'react'
import type { ProjectTab } from '../hooks/useProjectTabs'
import styles from '../styles/editor.module.css'

interface ProjectTabsProps {
  tabs: ProjectTab[]
  activeTabId: string
  onSwitchTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onAddTab: () => void
  onMoveTab: (fromId: string, toId: string) => void
}

export function ProjectTabs({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onAddTab,
  onMoveTab,
}: ProjectTabsProps) {
  const dragTabId = useRef<string | null>(null)

  const handleDragStart = useCallback(
    (e: React.DragEvent, tabId: string) => {
      dragTabId.current = tabId
      e.dataTransfer.effectAllowed = 'move'
    },
    [],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault()
      if (dragTabId.current && dragTabId.current !== targetId) {
        onMoveTab(dragTabId.current, targetId)
      }
      dragTabId.current = null
    },
    [onMoveTab],
  )

  return (
    <div className={styles.tabBar} role="tablist" aria-label="Project tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`${styles.tab} ${tab.id === activeTabId ? styles.tabActive : ''}`}
          role="tab"
          aria-selected={tab.id === activeTabId}
          tabIndex={tab.id === activeTabId ? 0 : -1}
          draggable
          onDragStart={(e) => handleDragStart(e, tab.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, tab.id)}
          onClick={() => onSwitchTab(tab.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSwitchTab(tab.id)
          }}
        >
          <span className={styles.tabName}>
            {tab.isDirty && <span className={styles.tabDirtyDot}>●</span>}
            {tab.name || 'Untitled'}
          </span>
          <button
            className={styles.tabCloseBtn}
            onClick={(e) => {
              e.stopPropagation()
              onCloseTab(tab.id)
            }}
            aria-label={`Close tab: ${tab.name}`}
            title="Close tab"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        className={styles.tabAddBtn}
        onClick={onAddTab}
        aria-label="New tab"
        title="New project tab"
      >
        +
      </button>
    </div>
  )
}

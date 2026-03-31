import React, { useState, useCallback, useRef, useEffect } from 'react'
import { MemoInput } from '../MemoInput'
import { ErrorPanel } from '../ErrorPanel'
import { ExportHeader } from '../ExportHeader'
import { JsonPreview } from '../JsonPreview'
import { FileMenu } from '../FileMenu'
import { ThemeSelector } from '../ThemeSelector'
import { ProjectTabs } from '../ProjectTabs'
import { SettingsPanel } from '../SettingsPanel'
import { useTabContext } from '../TabContextProvider'
import { useTheme } from '../../hooks/useTheme'
import { EDITOR_CONFIG } from '../../constants/editor'
import { useProjectStore } from 'shared/store/project.store'
import styles from '../../styles/editor.module.css'

export function EditorLayout() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftPercent, setLeftPercent] = useState(EDITOR_CONFIG.SPLIT_RATIO[0])
  const [isResizing, setIsResizing] = useState(false)
  const [errorPanelVisible, setErrorPanelVisible] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { theme, toggleTheme } = useTheme()
  const { tabs, activeTabId, activeTab, addTab, closeTab, switchTab, moveTab } = useTabContext()
  const errors = useProjectStore((s) => s.parserErrors)

  // Re-show error panel whenever new errors appear
  useEffect(() => {
    if (errors.length > 0) {
      setErrorPanelVisible(true)
    }
  }, [errors])

  const handleResizerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)

      const startX = e.clientX
      const startLeft = leftPercent

      const onMouseMove = (moveEvent: MouseEvent) => {
        const container = containerRef.current
        if (!container) return
        const totalWidth = container.clientWidth
        const delta = moveEvent.clientX - startX
        const deltaPercent = (delta / totalWidth) * 100
        const newLeft = Math.min(80, Math.max(20, startLeft + deltaPercent))
        setLeftPercent(newLeft)
      }

      const onMouseUp = () => {
        setIsResizing(false)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [leftPercent],
  )

  return (
    <div
      ref={containerRef}
      className={styles.editorRoot}
      style={{ cursor: isResizing ? 'col-resize' : undefined }}
    >
      {/* Top toolbar */}
      <div className={styles.toolbar}>
        <FileMenu />
        <ProjectTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitchTab={switchTab}
          onCloseTab={closeTab}
          onAddTab={() => addTab()}
          onMoveTab={moveTab}
        />
        <div className={styles.toolbarRight}>
          <ThemeSelector theme={theme} onThemeChange={toggleTheme} />
          <button
            className={styles.exportBtn}
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            aria-label="Open settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className={styles.splitContainer}>
        {/* Left panel */}
        <div
          className={styles.leftPanel}
          style={{ width: `${leftPercent}%` }}
        >
          <MemoInput showLineNumbers />
          {errorPanelVisible && (
            <ErrorPanel onClose={() => setErrorPanelVisible(false)} />
          )}
        </div>

        {/* Resizer */}
        <div
          className={`${styles.resizer} ${isResizing ? styles.resizerActive : ''}`}
          onMouseDown={handleResizerMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
        />

        {/* Right panel */}
        <div
          className={styles.rightPanel}
          style={{ width: `${100 - leftPercent}%` }}
        >
          <div className={styles.previewPanel}>
            <ExportHeader />
            <JsonPreview />
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}

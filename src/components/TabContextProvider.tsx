import React, { createContext, useContext, useCallback } from 'react'
import { useProjectTabs, type ProjectTab } from '../hooks/useProjectTabs'
import type { Project } from '../../shared/parser/types'

interface TabContextValue {
  tabs: ProjectTab[]
  activeTabId: string
  activeTab: ProjectTab | null
  addTab: (project?: Project, filePath?: string) => string
  closeTab: (tabId: string) => void
  switchTab: (tabId: string) => void
  renameTab: (tabId: string, newName: string) => void
  updateTabMemo: (tabId: string, memoText: string) => void
  updateTabProject: (tabId: string, project: Project) => void
  markTabClean: (tabId: string, filePath?: string) => void
  moveTab: (fromId: string, toId: string) => void
}

const TabContext = createContext<TabContextValue | null>(null)

export function TabContextProvider({ children }: { children: React.ReactNode }) {
  const tabState = useProjectTabs()
  return <TabContext.Provider value={tabState}>{children}</TabContext.Provider>
}

export function useTabContext(): TabContextValue {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTabContext must be used inside <TabContextProvider>')
  return ctx
}

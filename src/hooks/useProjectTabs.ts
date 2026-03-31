import { useState, useCallback } from 'react'
import type { Project } from '../../shared/parser/types'

export interface ProjectTab {
  id: string
  name: string
  project: Project
  isDirty: boolean
  filePath?: string
  memoText: string
}

let tabIdSeq = 0
function generateTabId(): string {
  return `tab-${++tabIdSeq}-${Math.random().toString(36).slice(2, 6)}`
}

function createDefaultProject(name = 'Untitled'): Project {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name,
    data: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function useProjectTabs() {
  const [tabs, setTabs] = useState<ProjectTab[]>(() => [
    {
      id: generateTabId(),
      name: 'Untitled',
      project: createDefaultProject('Untitled'),
      isDirty: false,
      memoText: '',
    },
  ])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? '')

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? null

  const addTab = useCallback((project?: Project, filePath?: string) => {
    const proj = project ?? createDefaultProject()
    const id = generateTabId()
    const newTab: ProjectTab = {
      id,
      name: proj.name,
      project: proj,
      isDirty: false,
      filePath,
      memoText: '',
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(id)
    return id
  }, [])

  const closeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId)
      if (remaining.length === 0) {
        const newTab: ProjectTab = {
          id: generateTabId(),
          name: 'Untitled',
          project: createDefaultProject(),
          isDirty: false,
          memoText: '',
        }
        setActiveTabId(newTab.id)
        return [newTab]
      }
      setActiveTabId((currentId) => {
        if (currentId === tabId) {
          const idx = prev.findIndex((t) => t.id === tabId)
          const next = remaining[Math.min(idx, remaining.length - 1)]
          return next.id
        }
        return currentId
      })
      return remaining
    })
  }, [])

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const renameTab = useCallback((tabId: string, newName: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? { ...t, name: newName, project: { ...t.project, name: newName }, isDirty: true }
          : t,
      ),
    )
  }, [])

  const updateTabMemo = useCallback((tabId: string, memoText: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, memoText, isDirty: true } : t)),
    )
  }, [])

  const updateTabProject = useCallback((tabId: string, project: Project) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, project, name: project.name, isDirty: true } : t,
      ),
    )
  }, [])

  const markTabClean = useCallback((tabId: string, filePath?: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, isDirty: false, filePath: filePath ?? t.filePath } : t,
      ),
    )
  }, [])

  const moveTab = useCallback((fromId: string, toId: string) => {
    setTabs((prev) => {
      const fromIdx = prev.findIndex((t) => t.id === fromId)
      const toIdx = prev.findIndex((t) => t.id === toId)
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev
      const next = [...prev]
      const [removed] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, removed)
      return next
    })
  }, [])

  return {
    tabs,
    activeTabId,
    activeTab,
    addTab,
    closeTab,
    switchTab,
    renameTab,
    updateTabMemo,
    updateTabProject,
    markTabClean,
    moveTab,
  }
}

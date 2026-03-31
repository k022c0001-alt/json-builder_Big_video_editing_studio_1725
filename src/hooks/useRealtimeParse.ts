import { useState, useCallback, useEffect, useRef } from 'react'
import { useProjectStore } from 'shared/store/project.store'
import { parseMemoToProject } from 'shared/parser/memoParser'
import { EDITOR_CONFIG } from '../constants/editor'

export function useRealtimeParse() {
  const setMemoText = useProjectStore((s) => s.setMemoText)
  const loadProject = useProjectStore((s) => s.loadProject)
  const memoText = useProjectStore((s) => s.memoText)

  const [localText, setLocalText] = useState(memoText)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTextChange = useCallback(
    (text: string) => {
      setLocalText(text)
      setMemoText(text)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        const result = parseMemoToProject(text)
        loadProject(result.project, result.errors)
      }, EDITOR_CONFIG.PARSE_DEBOUNCE_MS)
    },
    [setMemoText, loadProject],
  )

  // Run initial parse on mount
  useEffect(() => {
    const result = parseMemoToProject(localText)
    loadProject(result.project, result.errors)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { localText, handleTextChange }
}

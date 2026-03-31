import React, { useRef, useEffect, useState } from 'react'
import { useRealtimeParse } from '../hooks/useRealtimeParse'
import { registerInsertFn, deregisterInsertFn } from '../services/textareaRegistry'
import styles from '../styles/editor.module.css'

interface MemoInputProps {
  showLineNumbers?: boolean
}

export function MemoInput({ showLineNumbers = true }: MemoInputProps) {
  const { localText, handleTextChange } = useRealtimeParse()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumRef = useRef<HTMLDivElement>(null)
  const [lineCount, setLineCount] = useState(1)

  useEffect(() => {
    const lines = localText.split('\n').length
    setLineCount(lines)
  }, [localText])

  // Register the insert function so DataAddPanel / useDataAddition can insert text
  useEffect(() => {
    registerInsertFn((text, mode) => {
      const el = textareaRef.current
      if (!el) return

      const currentValue = el.value

      let newValue: string
      let newCursorPos: number

      if (mode === 'cursor') {
        const start = el.selectionStart ?? currentValue.length
        const end = el.selectionEnd ?? currentValue.length
        const prefix = currentValue.slice(0, start)
        const suffix = currentValue.slice(end)
        const sep = prefix.length > 0 && !prefix.endsWith('\n') ? '\n' : ''
        const insertion = sep + text
        newValue = prefix + insertion + suffix
        newCursorPos = start + insertion.length
      } else {
        const sep = currentValue.length > 0 && !currentValue.endsWith('\n') ? '\n' : ''
        newValue = currentValue + sep + text
        newCursorPos = newValue.length
      }

      handleTextChange(newValue)

      // Restore focus and cursor position after React re-render
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      })
    })

    return () => {
      deregisterInsertFn()
    }
  }, [handleTextChange])

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (lineNumRef.current && textareaRef.current) {
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')

  return (
    <div className={styles.memoWrapper}>
      {showLineNumbers && (
        <div ref={lineNumRef} className={styles.lineNumbers} aria-hidden="true">
          {lineNumbers}
        </div>
      )}
      <textarea
        ref={textareaRef}
        className={styles.memoTextarea}
        value={localText}
        onChange={(e) => handleTextChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={
          '# Project Name\n## Section\n- key: value\n- flag\n\n## Another Section\n- nested: data'
        }
        spellCheck={false}
        aria-label="Markdown memo input"
      />
    </div>
  )
}

import React, { useRef, useEffect, useState } from 'react'
import { useRealtimeParse } from '../hooks/useRealtimeParse'
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

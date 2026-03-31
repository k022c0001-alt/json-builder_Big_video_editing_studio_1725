import { insertAtCursor } from '../services/textareaRegistry'

/**
 * Provides helper functions that insert formatted Markdown text into the
 * active memo textarea at the current cursor position.
 */
export function useDataAddition() {
  const insertKeyValue = (key: string, value: string) => {
    insertAtCursor(`- ${key}: ${value}`)
  }

  const insertSection = (sectionName: string) => {
    insertAtCursor(`## ${sectionName}`)
  }

  const insertArray = (items: string[]) => {
    const line = `- ${items.join(', ')}`
    insertAtCursor(line)
  }

  const insertJsonBlock = (jsonStr: string) => {
    insertAtCursor('```json\n' + jsonStr + '\n```')
  }

  const insertComment = (comment: string) => {
    insertAtCursor(`# ${comment}`)
  }

  return {
    insertKeyValue,
    insertSection,
    insertArray,
    insertJsonBlock,
    insertComment,
  }
}

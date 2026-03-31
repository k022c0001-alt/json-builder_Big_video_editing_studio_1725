/**
 * A lightweight registry that lets the DataAddition hooks insert text into
 * the active textarea without needing prop-drilling or a heavy React context.
 *
 * MemoInput calls `registerInsertFn` when it mounts and `deregisterInsertFn`
 * when it unmounts.  `insertText` / `appendText` are called by useDataAddition.
 */

type InsertFn = (text: string, mode: 'cursor' | 'append') => void

let _insertFn: InsertFn | null = null

export function registerInsertFn(fn: InsertFn): void {
  _insertFn = fn
}

export function deregisterInsertFn(): void {
  _insertFn = null
}

/** Insert text at the current cursor position (falls back to append). */
export function insertAtCursor(text: string): void {
  _insertFn?.(text, 'cursor')
}

/** Append text to the end of the editor content. */
export function appendText(text: string): void {
  _insertFn?.(text, 'append')
}

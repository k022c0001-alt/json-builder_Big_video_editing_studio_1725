import { create } from 'zustand'
import type { ParserError, Project } from '../parser/types'

export interface ProjectStore {
  project: Project | null
  memoText: string
  parserErrors: ParserError[]

  setProject(project: Project | null): void
  setMemoText(text: string): void
  setParserErrors(errors: ParserError[]): void
  loadProject(project: Project | null, errors: ParserError[]): void

  /** Append text (with a leading newline) to the end of the editor content. */
  appendText(text: string): void
  /** Insert text at the given zero-based line number (0 = prepend). */
  insertAtLine(lineNum: number, text: string): void
  /** Replace the entire memo text (e.g. when loading a template). */
  replaceText(text: string): void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,
  memoText: '',
  parserErrors: [],

  setProject: (project) => set({ project }),
  setMemoText: (memoText) => set({ memoText }),
  setParserErrors: (parserErrors) => set({ parserErrors }),
  loadProject: (project, errors) => set({ project, parserErrors: errors }),

  appendText: (text: string) => {
    const current = get().memoText
    const separator = current.length > 0 && !current.endsWith('\n') ? '\n' : ''
    set({ memoText: current + separator + text })
  },

  insertAtLine: (lineNum: number, text: string) => {
    const lines = get().memoText.split('\n')
    const clampedLine = Math.min(Math.max(0, lineNum), lines.length)
    lines.splice(clampedLine, 0, text)
    set({ memoText: lines.join('\n') })
  },

  replaceText: (text: string) => {
    set({ memoText: text })
  },
}))

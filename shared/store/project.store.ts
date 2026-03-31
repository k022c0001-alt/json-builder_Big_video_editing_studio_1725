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
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  memoText: '',
  parserErrors: [],

  setProject: (project) => set({ project }),
  setMemoText: (memoText) => set({ memoText }),
  setParserErrors: (parserErrors) => set({ parserErrors }),
  loadProject: (project, errors) => set({ project, parserErrors: errors }),
}))

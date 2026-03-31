export type ErrorSeverity = 'error' | 'warning'

export interface ParserError {
  line?: number
  column?: number
  message: string
  severity: ErrorSeverity
  suggestion?: string
}

export interface JsonValue {
  [key: string]: unknown
}

export interface Project {
  id: string
  name: string
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

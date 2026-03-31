export type ErrorSeverity = 'error' | 'warning'

export interface ParserError {
  severity: ErrorSeverity
  line?: number
  section: string
  message: string
  suggestion?: string
}

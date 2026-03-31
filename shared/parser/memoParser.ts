import type { ParserError, Project } from './types'

export interface ParseResult {
  project: Project | null
  errors: ParserError[]
}

/**
 * Parse markdown memo text into a Project object.
 *
 * Supported syntax:
 *   # Section name         -> top-level key
 *   ## Sub-section         -> nested key
 *   - key: value           -> key/value pair
 *   - key                  -> boolean true flag
 *   ```json ... ```        -> raw JSON block (merged into parent section)
 */
export function parseMemoToProject(text: string): ParseResult {
  const errors: ParserError[] = []
  const data: Record<string, unknown> = {}

  if (!text || text.trim() === '') {
    return {
      project: {
        id: '',
        name: '',
        data: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      errors: [],
    }
  }

  const lines = text.split('\n')
  let projectName = ''
  let currentSection: string | null = null
  let currentSubSection: string | null = null
  let inCodeBlock = false
  let codeBlockContent = ''
  let codeBlockLang = ''

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    const line = lines[i]

    // Handle code block end
    if (inCodeBlock) {
      if (line.trim() === '```') {
        inCodeBlock = false
        if (codeBlockLang === 'json') {
          try {
            const parsed = JSON.parse(codeBlockContent.trim())
            if (currentSubSection && currentSection) {
              const section = data[currentSection] as Record<string, unknown>
              section[currentSubSection] = parsed
            } else if (currentSection) {
              const section = data[currentSection] as Record<string, unknown>
              Object.assign(section, parsed)
            } else {
              Object.assign(data, parsed)
            }
          } catch {
            errors.push({
              line: lineNum,
              message: 'Invalid JSON in code block',
              severity: 'error',
              suggestion: 'Ensure the JSON inside ``` blocks is valid JSON syntax.',
            })
          }
        }
        codeBlockContent = ''
        codeBlockLang = ''
      } else {
        codeBlockContent += line + '\n'
      }
      continue
    }

    // Handle code block start
    const codeBlockMatch = line.match(/^```(\w*)/)
    if (codeBlockMatch) {
      inCodeBlock = true
      codeBlockLang = codeBlockMatch[1] || ''
      codeBlockContent = ''
      continue
    }

    // H1: project name / top-level
    const h1Match = line.match(/^#\s+(.+)$/)
    if (h1Match) {
      projectName = h1Match[1].trim()
      currentSection = null
      currentSubSection = null
      continue
    }

    // H2: section
    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      currentSection = h2Match[1].trim()
      currentSubSection = null
      if (!data[currentSection]) {
        data[currentSection] = {}
      }
      continue
    }

    // H3: sub-section
    const h3Match = line.match(/^###\s+(.+)$/)
    if (h3Match) {
      currentSubSection = h3Match[1].trim()
      if (currentSection) {
        const section = data[currentSection] as Record<string, unknown>
        if (!section[currentSubSection]) {
          section[currentSubSection] = {}
        }
      }
      continue
    }

    // List item: - key: value  or  - key
    const listMatch = line.match(/^[-*]\s+(.+)$/)
    if (listMatch) {
      const item = listMatch[1].trim()
      const kvMatch = item.match(/^([^:]+):\s*(.*)$/)

      let key: string
      let value: unknown

      if (kvMatch) {
        key = kvMatch[1].trim()
        const rawValue = kvMatch[2].trim()
        value = parseValue(rawValue)
      } else {
        key = item
        value = true
      }

      if (currentSubSection && currentSection) {
        const section = data[currentSection] as Record<string, unknown>
        const sub = section[currentSubSection] as Record<string, unknown>
        sub[key] = value
      } else if (currentSection) {
        const section = data[currentSection] as Record<string, unknown>
        section[key] = value
      } else {
        data[key] = value
      }
      continue
    }

    // Skip empty lines and pure text lines (treated as comments)
    if (line.trim() !== '' && !line.startsWith('>') && !line.startsWith('---')) {
      // Attempt to detect common formatting issues
      if (line.trim().startsWith('key:') || line.trim().startsWith('value:')) {
        errors.push({
          line: lineNum,
          message: `Content outside of list item. Did you mean "- ${line.trim()}"?`,
          severity: 'warning',
          suggestion: 'Prefix key-value lines with "- " to include them in the JSON output.',
        })
      }
    }
  }

  if (inCodeBlock) {
    errors.push({
      message: 'Unclosed code block (missing closing ```)',
      severity: 'error',
      suggestion: 'Add closing ``` to terminate the code block.',
    })
  }

  return {
    project: {
      id: generateId(),
      name: projectName || 'Untitled',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    errors,
  }
}

function parseValue(raw: string): unknown {
  if (raw === '') return ''
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw === 'null') return null
  const num = Number(raw)
  if (!isNaN(num) && raw !== '') return num
  // Array syntax: [a, b, c]
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      return JSON.parse(raw)
    } catch {
      return raw.slice(1, -1).split(',').map((s) => parseValue(s.trim()))
    }
  }
  // Strip surrounding quotes
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1)
  }
  return raw
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

import type { ParserError } from './types'

export interface ShortcutEntry {
  action: string
  keybind: string
}

export interface ShortcutsSection {
  [category: string]: { [action: string]: string }
}

export interface ShortcutsParseResult {
  name: string
  shortcuts: ShortcutsSection
  errors: ParserError[]
}

/**
 * Supported modifier keys for keybind validation.
 * Both 'Cmd' and 'Meta' are accepted to cover common Mac notations
 * ('Cmd' is the conventional shorthand; 'Meta' is the DOM key name).
 */
const MODIFIER_KEYS = ['Ctrl', 'Alt', 'Shift', 'Cmd', 'Win', 'Meta']

/**
 * Supported non-modifier keys for keybind validation.
 * Includes letters, digits, function keys, and common special keys.
 */
const SPECIAL_KEYS = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Enter', 'Return', 'Esc', 'Escape', 'Tab', 'Space', 'Backspace', 'Delete',
  'Insert', 'Home', 'End', 'PageUp', 'PageDown',
  'Up', 'Down', 'Left', 'Right',
  'PrintScreen', 'ScrollLock', 'Pause', 'Break', 'NumLock', 'CapsLock',
]

/**
 * Validates that a keybind string is in a recognised format.
 *
 * Accepted formats:
 *   - Single key:              F5, Esc
 *   - Modifier + key:          Ctrl+S, Alt+F4
 *   - Multi-modifier + key:    Ctrl+Shift+S, Ctrl+Alt+Delete
 *
 * @returns true if the keybind is valid, false otherwise.
 */
export function validateKeybind(keybind: string): boolean {
  if (!keybind || keybind.trim() === '') return false

  const parts = keybind.split('+').map((p) => p.trim())
  if (parts.length === 0) return false

  const lastKey = parts[parts.length - 1]
  const modifiers = parts.slice(0, -1)

  // Every part except the last must be a recognised modifier
  for (const mod of modifiers) {
    if (!MODIFIER_KEYS.includes(mod)) return false
  }

  // The last part must be a letter, digit, special key, or recognised symbol
  if (SPECIAL_KEYS.includes(lastKey)) return true
  if (/^[A-Za-z0-9]$/.test(lastKey)) return true
  // Allow common symbol keys
  if (/^[`~!@#$%^&*()_\-+=[\]{}|\\;:'",.<>?/]$/.test(lastKey)) return true

  return false
}

/**
 * Parse markdown text that contains an `## @shortcuts` section.
 *
 * Syntax:
 *   # App Name
 *
 *   ## @shortcuts
 *
 *   ### Category Name
 *   - Ctrl+Z: Undo
 *   - Ctrl+Y: Redo
 *
 * The `@shortcuts` section (or a plain `## shortcuts` section) is extracted
 * and converted to:
 *   {
 *     "Category Name": {
 *       "Undo": "Ctrl+Z",
 *       "Redo": "Ctrl+Y"
 *     }
 *   }
 *
 * @param text  Full markdown memo text.
 * @returns     Parsed result with name, shortcuts map, and any validation errors.
 */
export function parseShortcuts(text: string): ShortcutsParseResult {
  const errors: ParserError[] = []
  const shortcuts: ShortcutsSection = {}
  let name = ''

  if (!text || text.trim() === '') {
    return { name, shortcuts, errors }
  }

  const lines = text.split('\n')
  let inShortcutsSection = false
  let currentCategory: string | null = null

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    const line = lines[i]

    // H1: project / app name
    const h1Match = line.match(/^#\s+(.+)$/)
    if (h1Match) {
      name = h1Match[1].trim()
      continue
    }

    // H2: detect @shortcuts (or shortcuts) section
    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      const sectionName = h2Match[1].trim()
      if (sectionName === '@shortcuts' || sectionName.toLowerCase() === 'shortcuts') {
        inShortcutsSection = true
        currentCategory = null
      } else {
        inShortcutsSection = false
        currentCategory = null
      }
      continue
    }

    if (!inShortcutsSection) continue

    // H3: category within @shortcuts
    const h3Match = line.match(/^###\s+(.+)$/)
    if (h3Match) {
      currentCategory = h3Match[1].trim()
      if (!shortcuts[currentCategory]) {
        shortcuts[currentCategory] = {}
      }
      continue
    }

    // List item: - Keybind: Action description
    const listMatch = line.match(/^[-*]\s+(.+)$/)
    if (listMatch) {
      const item = listMatch[1].trim()
      const colonIdx = item.indexOf(':')

      if (colonIdx === -1) {
        errors.push({
          line: lineNum,
          message: `Shortcut entry missing colon separator: "${item}"`,
          severity: 'warning',
          suggestion: 'Use the format "- Ctrl+S: Save" with a colon between keybind and action.',
        })
        continue
      }

      const keybind = item.slice(0, colonIdx).trim()
      const action = item.slice(colonIdx + 1).trim()

      if (!validateKeybind(keybind)) {
        errors.push({
          line: lineNum,
          message: `Invalid keybind: "${keybind}"`,
          severity: 'warning',
          suggestion:
            'Keybinds must use the format Modifier+Key (e.g. Ctrl+S, Ctrl+Shift+Z, F5).',
        })
      }

      if (!action) {
        errors.push({
          line: lineNum,
          message: `Shortcut entry is missing an action description after the colon: "${item}"`,
          severity: 'warning',
          suggestion: 'Add an action name, e.g. "- Ctrl+S: Save".',
        })
        continue
      }

      const target = currentCategory ? shortcuts[currentCategory] : (shortcuts['General'] = shortcuts['General'] ?? {})
      // Key = action name, value = keybind (JSON output is "Action": "Keybind")
      target[action] = keybind
    }
  }

  return { name, shortcuts, errors }
}

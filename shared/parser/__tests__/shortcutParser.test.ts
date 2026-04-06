import { describe, it, expect } from 'vitest'
import { parseShortcuts, validateKeybind } from '../shortcutParser'

// ============================================================
// validateKeybind
// ============================================================

describe('validateKeybind', () => {
  it('accepts a single letter key', () => {
    expect(validateKeybind('S')).toBe(true)
  })

  it('accepts a single function key', () => {
    expect(validateKeybind('F5')).toBe(true)
  })

  it('accepts Ctrl + letter', () => {
    expect(validateKeybind('Ctrl+S')).toBe(true)
  })

  it('accepts Alt + letter', () => {
    expect(validateKeybind('Alt+F4')).toBe(true)
  })

  it('accepts multi-modifier keybind', () => {
    expect(validateKeybind('Ctrl+Shift+S')).toBe(true)
  })

  it('accepts Cmd modifier (Mac)', () => {
    expect(validateKeybind('Cmd+Z')).toBe(true)
  })

  it('accepts special keys like Esc and Enter', () => {
    expect(validateKeybind('Esc')).toBe(true)
    expect(validateKeybind('Enter')).toBe(true)
  })

  it('accepts Ctrl + Delete', () => {
    expect(validateKeybind('Ctrl+Delete')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateKeybind('')).toBe(false)
  })

  it('rejects unknown modifier', () => {
    expect(validateKeybind('Super+S')).toBe(false)
  })

  it('rejects keybind with modifier only (no trailing key)', () => {
    // 'Ctrl' alone has no trailing non-modifier key after splitting
    expect(validateKeybind('Ctrl+')).toBe(false)
  })
})

// ============================================================
// parseShortcuts – basic parsing
// ============================================================

describe('parseShortcuts – basic parsing', () => {
  it('returns empty result for empty input', () => {
    const result = parseShortcuts('')
    expect(result.name).toBe('')
    expect(result.shortcuts).toEqual({})
    expect(result.errors).toHaveLength(0)
  })

  it('extracts project name from H1', () => {
    const text = '# My App\n\n## @shortcuts\n'
    const result = parseShortcuts(text)
    expect(result.name).toBe('My App')
  })

  it('parses a single category with one shortcut', () => {
    const text = `# App

## @shortcuts

### Editor
- Ctrl+Z: Undo
`
    const result = parseShortcuts(text)
    expect(result.errors).toHaveLength(0)
    expect(result.shortcuts['Editor']).toBeDefined()
    expect(result.shortcuts['Editor']['Undo']).toBe('Ctrl+Z')
  })

  it('parses multiple categories', () => {
    const text = `# App

## @shortcuts

### Editor
- Ctrl+Z: Undo
- Ctrl+Y: Redo

### File
- Ctrl+O: Open
- Ctrl+S: Save
`
    const result = parseShortcuts(text)
    expect(result.errors).toHaveLength(0)
    expect(result.shortcuts['Editor']['Undo']).toBe('Ctrl+Z')
    expect(result.shortcuts['Editor']['Redo']).toBe('Ctrl+Y')
    expect(result.shortcuts['File']['Open']).toBe('Ctrl+O')
    expect(result.shortcuts['File']['Save']).toBe('Ctrl+S')
  })

  it('ignores content outside @shortcuts section', () => {
    const text = `# App

## Settings
- theme: dark

## @shortcuts

### Edit
- Ctrl+C: Copy
`
    const result = parseShortcuts(text)
    expect(result.shortcuts['Edit']['Copy']).toBe('Ctrl+C')
    expect(result.shortcuts['Settings']).toBeUndefined()
  })

  it('also recognises plain "shortcuts" section heading', () => {
    const text = `# App

## shortcuts

### Nav
- Ctrl+G: Go to Line
`
    const result = parseShortcuts(text)
    expect(result.shortcuts['Nav']['Go to Line']).toBe('Ctrl+G')
  })

  it('action name may include ampersands and spaces', () => {
    const text = `# App

## @shortcuts

### Edit
- Ctrl+H: Find & Replace
`
    const result = parseShortcuts(text)
    expect(result.shortcuts['Edit']['Find & Replace']).toBe('Ctrl+H')
  })

  it('shortcut without a category goes into General', () => {
    const text = `# App

## @shortcuts

- F5: Refresh
`
    const result = parseShortcuts(text)
    expect(result.shortcuts['General']['Refresh']).toBe('F5')
  })
})

// ============================================================
// parseShortcuts – platform-specific keybinds
// ============================================================

describe('parseShortcuts – platform keybinds', () => {
  it('handles Cmd modifier (Mac)', () => {
    const text = `## @shortcuts\n### Mac\n- Cmd+S: Save\n`
    const result = parseShortcuts(text)
    expect(result.shortcuts['Mac']['Save']).toBe('Cmd+S')
  })

  it('handles Win modifier', () => {
    const text = `## @shortcuts\n### Windows\n- Win+D: Show Desktop\n`
    const result = parseShortcuts(text)
    expect(result.shortcuts['Windows']['Show Desktop']).toBe('Win+D')
  })

  it('handles Ctrl+Shift+Alt multi-modifier', () => {
    const text = `## @shortcuts\n### Dev\n- Ctrl+Shift+Alt+R: Hard Reload\n`
    const result = parseShortcuts(text)
    expect(result.shortcuts['Dev']['Hard Reload']).toBe('Ctrl+Shift+Alt+R')
  })
})

// ============================================================
// parseShortcuts – error handling
// ============================================================

describe('parseShortcuts – error handling', () => {
  it('reports a warning for invalid keybind', () => {
    const text = `## @shortcuts\n### Edit\n- SuperKey+S: Save\n`
    const result = parseShortcuts(text)
    expect(result.errors.some((e) => e.message.includes('Invalid keybind'))).toBe(true)
    expect(result.errors[0].severity).toBe('warning')
  })

  it('reports a warning when colon is missing', () => {
    const text = `## @shortcuts\n### Edit\n- Ctrl+S Save\n`
    const result = parseShortcuts(text)
    expect(result.errors.some((e) => e.message.includes('missing colon'))).toBe(true)
  })

  it('reports a warning when action description is empty', () => {
    const text = `## @shortcuts\n### Edit\n- Ctrl+S: \n`
    const result = parseShortcuts(text)
    expect(result.errors.some((e) => e.message.includes('missing an action description'))).toBe(true)
  })

  it('does not fail on completely unrelated markdown', () => {
    const text = `# Random Doc\n\nSome paragraph text.\n`
    expect(() => parseShortcuts(text)).not.toThrow()
  })
})

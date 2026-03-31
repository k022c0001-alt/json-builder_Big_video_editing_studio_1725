import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '../../../shared/store/project.store'
import { TEMPLATES } from '../../utils/templates'

// ============================================================
// Tests: templates utility
// ============================================================

describe('TEMPLATES', () => {
  it('contains a blank template with empty content', () => {
    const blank = TEMPLATES.find((t) => t.key === 'blank')
    expect(blank).toBeDefined()
    expect(blank!.content).toBe('')
  })

  it('contains database, api, userProfile and settings templates', () => {
    const keys = TEMPLATES.map((t) => t.key)
    expect(keys).toContain('database')
    expect(keys).toContain('api')
    expect(keys).toContain('userProfile')
    expect(keys).toContain('settings')
  })

  it('each template has label, icon and description', () => {
    for (const tpl of TEMPLATES) {
      expect(tpl.label.length).toBeGreaterThan(0)
      expect(tpl.icon.length).toBeGreaterThan(0)
      expect(tpl.description.length).toBeGreaterThan(0)
    }
  })

  it('database template content starts with # Project: Database Config', () => {
    const db = TEMPLATES.find((t) => t.key === 'database')!
    expect(db.content).toMatch(/^# Project: Database Config/)
  })
})

// ============================================================
// Tests: project store extensions (appendText, insertAtLine, replaceText)
// ============================================================

describe('ProjectStore extensions', () => {
  beforeEach(() => {
    useProjectStore.setState({ project: null, memoText: '', parserErrors: [] })
  })

  describe('appendText', () => {
    it('appends text to empty memoText without leading newline', () => {
      useProjectStore.getState().appendText('- key: value')
      expect(useProjectStore.getState().memoText).toBe('- key: value')
    })

    it('appends text with a newline separator when content exists', () => {
      useProjectStore.setState({ memoText: '# Project' })
      useProjectStore.getState().appendText('## Section')
      expect(useProjectStore.getState().memoText).toBe('# Project\n## Section')
    })

    it('does not add double newline when existing text ends with newline', () => {
      useProjectStore.setState({ memoText: '# Project\n' })
      useProjectStore.getState().appendText('## Section')
      expect(useProjectStore.getState().memoText).toBe('# Project\n## Section')
    })
  })

  describe('insertAtLine', () => {
    it('inserts at line 0 (prepend)', () => {
      useProjectStore.setState({ memoText: '## Section\n- key: value' })
      useProjectStore.getState().insertAtLine(0, '# Project')
      expect(useProjectStore.getState().memoText).toBe('# Project\n## Section\n- key: value')
    })

    it('inserts in the middle', () => {
      useProjectStore.setState({ memoText: 'line1\nline3' })
      useProjectStore.getState().insertAtLine(1, 'line2')
      expect(useProjectStore.getState().memoText).toBe('line1\nline2\nline3')
    })

    it('appends when line number equals line count', () => {
      useProjectStore.setState({ memoText: 'line1\nline2' })
      useProjectStore.getState().insertAtLine(2, 'line3')
      expect(useProjectStore.getState().memoText).toBe('line1\nline2\nline3')
    })

    it('clamps line number to valid range', () => {
      useProjectStore.setState({ memoText: 'line1' })
      useProjectStore.getState().insertAtLine(999, 'line2')
      expect(useProjectStore.getState().memoText).toBe('line1\nline2')
    })
  })

  describe('replaceText', () => {
    it('replaces entire memoText', () => {
      useProjectStore.setState({ memoText: '# Old content' })
      useProjectStore.getState().replaceText('# New content')
      expect(useProjectStore.getState().memoText).toBe('# New content')
    })

    it('can replace with empty string', () => {
      useProjectStore.setState({ memoText: '# Something' })
      useProjectStore.getState().replaceText('')
      expect(useProjectStore.getState().memoText).toBe('')
    })
  })
})

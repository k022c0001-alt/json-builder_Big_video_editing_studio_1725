import { describe, it, expect } from 'vitest'
import { parseMemoToProject } from '../../shared/parser/memoParser'

describe('parseMemoToProject', () => {
  it('returns empty project for empty input', () => {
    const result = parseMemoToProject('')
    expect(result.errors).toHaveLength(0)
    expect(result.project).not.toBeNull()
    expect(result.project!.data).toEqual({})
  })

  it('parses H1 as project name', () => {
    const result = parseMemoToProject('# My Project')
    expect(result.project!.name).toBe('My Project')
  })

  it('parses H2 as section', () => {
    const result = parseMemoToProject('# App\n## Settings\n- theme: dark')
    expect(result.project!.data).toHaveProperty('Settings')
    expect((result.project!.data['Settings'] as Record<string, unknown>)['theme']).toBe('dark')
  })

  it('parses H3 as sub-section', () => {
    const result = parseMemoToProject('## Config\n### DB\n- host: localhost')
    const config = result.project!.data['Config'] as Record<string, unknown>
    const db = config['DB'] as Record<string, unknown>
    expect(db['host']).toBe('localhost')
  })

  it('parses boolean values', () => {
    const result = parseMemoToProject('- active: true\n- inactive: false')
    expect(result.project!.data['active']).toBe(true)
    expect(result.project!.data['inactive']).toBe(false)
  })

  it('parses numeric values', () => {
    const result = parseMemoToProject('- count: 42\n- ratio: 3.14')
    expect(result.project!.data['count']).toBe(42)
    expect(result.project!.data['ratio']).toBe(3.14)
  })

  it('parses null values', () => {
    const result = parseMemoToProject('- value: null')
    expect(result.project!.data['value']).toBeNull()
  })

  it('parses bare list items as true flags', () => {
    const result = parseMemoToProject('- enabled')
    expect(result.project!.data['enabled']).toBe(true)
  })

  it('reports error for unclosed code block', () => {
    const result = parseMemoToProject('```json\n{ "key": "value" }')
    expect(result.errors.some((e) => e.severity === 'error')).toBe(true)
  })

  it('parses valid inline JSON code block', () => {
    const result = parseMemoToProject('## Meta\n```json\n{"version": 2}\n```')
    const meta = result.project!.data['Meta'] as Record<string, unknown>
    expect(meta['version']).toBe(2)
  })
})

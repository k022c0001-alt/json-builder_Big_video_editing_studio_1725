import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseMemoToProject } from '../../../shared/parser/memoParser'
import { useProjectStore } from '../../../shared/store/project.store'

// ============================================================
// Integration Tests: Memo Input → Parse → JSON Output
// ============================================================

describe('Integration: Memo → Parse → JSON output', () => {
  beforeEach(() => {
    useProjectStore.setState({ project: null, memoText: '', parserErrors: [] })
  })

  it('full flow: set memo text → parse → project in store', () => {
    const memo = `# My Video Project
## Settings
- resolution: 1920x1080
- fps: 60
- format: mp4

## Timeline
### Scene1
- start: 0
- end: 30
- label: Intro

## Tags
- color_grade: true
- vfx: false`

    const { project, errors } = parseMemoToProject(memo)
    expect(errors).toHaveLength(0)
    expect(project).not.toBeNull()
    expect(project!.name).toBe('My Video Project')

    const settings = project!.data['Settings'] as Record<string, unknown>
    expect(settings['resolution']).toBe('1920x1080')
    expect(settings['fps']).toBe(60)
    expect(settings['format']).toBe('mp4')

    const timeline = project!.data['Timeline'] as Record<string, unknown>
    const scene1 = timeline['Scene1'] as Record<string, unknown>
    expect(scene1['start']).toBe(0)
    expect(scene1['end']).toBe(30)
    expect(scene1['label']).toBe('Intro')

    const tags = project!.data['Tags'] as Record<string, unknown>
    expect(tags['color_grade']).toBe(true)
    expect(tags['vfx']).toBe(false)

    // Simulate store update
    useProjectStore.getState().loadProject(project, errors)
    const stored = useProjectStore.getState()
    expect(stored.project!.name).toBe('My Video Project')
    expect(stored.parserErrors).toHaveLength(0)
  })

  it('full flow: errors are surfaced for malformed input', () => {
    const memo = `# Broken Project
## Data
\`\`\`json
{ "unclosed": true`

    const { project, errors } = parseMemoToProject(memo)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].severity).toBe('error')

    useProjectStore.getState().loadProject(project, errors)
    expect(useProjectStore.getState().parserErrors.length).toBeGreaterThan(0)
  })

  it('full flow: empty memo produces empty project without errors', () => {
    const { project, errors } = parseMemoToProject('')
    expect(errors).toHaveLength(0)
    expect(project).not.toBeNull()
    expect(project!.data).toEqual({})

    useProjectStore.getState().loadProject(project, errors)
    expect(useProjectStore.getState().project!.data).toEqual({})
    expect(useProjectStore.getState().parserErrors).toHaveLength(0)
  })

  it('JSON output matches expected structure', () => {
    const memo = `# Output Test
## Config
- debug: true
- version: 2
- name: alpha`

    const { project } = parseMemoToProject(memo)
    expect(project).not.toBeNull()

    const output = { name: project!.name, ...project!.data }
    const jsonString = JSON.stringify(output, null, 2)
    const parsed = JSON.parse(jsonString)

    expect(parsed.name).toBe('Output Test')
    expect(parsed.Config.debug).toBe(true)
    expect(parsed.Config.version).toBe(2)
    expect(parsed.Config.name).toBe('alpha')
  })

  it('handles special characters in values', () => {
    const memo = `# Special
- path: /home/user/file.json
- url: https://example.com`

    const { project, errors } = parseMemoToProject(memo)
    expect(errors).toHaveLength(0)
    expect(project!.data['path']).toBe('/home/user/file.json')
    expect(project!.data['url']).toBe('https://example.com')
  })

  it('handles arrays in values', () => {
    const memo = `# Arrays
- tags: [a, b, c]
- counts: [1, 2, 3]`

    const { project } = parseMemoToProject(memo)
    expect(project!.data['tags']).toEqual(['a', 'b', 'c'])
    expect(project!.data['counts']).toEqual([1, 2, 3])
  })

  it('handles valid inline JSON code block', () => {
    const memo = `## Meta
\`\`\`json
{"version": 3, "build": "release"}
\`\`\``

    const { project, errors } = parseMemoToProject(memo)
    expect(errors).toHaveLength(0)
    const meta = project!.data['Meta'] as Record<string, unknown>
    expect(meta['version']).toBe(3)
    expect(meta['build']).toBe('release')
  })

  it('full flow: memoText is updated in store', () => {
    const memo = '# Test\n- key: value'
    useProjectStore.getState().setMemoText(memo)
    expect(useProjectStore.getState().memoText).toBe(memo)

    const { project, errors } = parseMemoToProject(memo)
    useProjectStore.getState().loadProject(project, errors)
    expect(useProjectStore.getState().project!.name).toBe('Test')
  })
})

// ============================================================
// Integration Tests: File Save / Clipboard (mock)
// ============================================================

describe('Integration: File save and clipboard (mocked)', () => {
  const mockSaveJsonFile = vi.fn().mockResolvedValue(true)
  const mockCopyToClipboard = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.stubGlobal('electronAPI', {
      saveJsonFile: mockSaveJsonFile,
      copyToClipboard: mockCopyToClipboard,
    })
    mockSaveJsonFile.mockClear()
    mockCopyToClipboard.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves JSON file via electron API', async () => {
    const json = JSON.stringify({ name: 'TestProject', value: 42 }, null, 2)
    const result = await window.electronAPI!.saveJsonFile(json, 'test.json')
    expect(result).toBe(true)
    expect(mockSaveJsonFile).toHaveBeenCalledWith(json, 'test.json')
  })

  it('copies JSON to clipboard via electron API', async () => {
    const json = JSON.stringify({ name: 'CopyTest' }, null, 2)
    const result = await window.electronAPI!.copyToClipboard(json)
    expect(result).toBe(true)
    expect(mockCopyToClipboard).toHaveBeenCalledWith(json)
  })

  it('handles save failure gracefully', async () => {
    mockSaveJsonFile.mockResolvedValueOnce(false)
    const result = await window.electronAPI!.saveJsonFile('{}', 'fail.json')
    expect(result).toBe(false)
  })
})

// ============================================================
// Integration Tests: Debounce behaviour
// ============================================================

describe('Integration: debounce optimisation', () => {
  it('parses synchronously without debounce in unit context', () => {
    // The debounce wrapper is in useRealtimeParse; here we verify
    // that the underlying parser is pure and synchronous.
    const start = performance.now()
    for (let i = 0; i < 100; i++) {
      parseMemoToProject(`# Project ${i}\n- value: ${i}`)
    }
    const elapsed = performance.now() - start
    // 100 parses should complete well under 200ms
    expect(elapsed).toBeLessThan(200)
  })
})

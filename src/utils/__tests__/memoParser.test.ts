import {
  parseMemoToProject,
  validateMemoStructure,
  extractSection,
  parseKeyValueLine,
  parseTimeRange,
  parseProjectHeader,
  parseTimeline,
  parseResources,
  parseAssets,
  parseChapters,
  parseSponsors,
} from '../memoParser'

// ---------------------------------------------------------------------------
// Helper: a complete valid memo
// ---------------------------------------------------------------------------
const VALID_MEMO = `# Project: My Test Project
- Duration: 60s
- Resolution: 1920x1080
- FPS: 30
- SampleRate: 48000

## Timeline
### Track: captions_main
- [0.0-2.5] "Hello world" | style: default_caption
- [3.0-5.0] "Second line" | style: highlight_caption

## Resources
### Styles
- default_caption: fontFamily=Arial, fontSize=32, color=#ffffff
- highlight_caption: fontFamily=Bebas, fontSize=40, color=#ffcc00, effect=typewriter

## Assets
### Video
- intro_video: path=/videos/intro.mp4, duration=30

### Audio
- background_music: path=/audio/bg.mp3

### Image
- logo: path=/images/logo.png, width=200, height=100

## Chapters
- [0.0] "Introduction"
- [30.0] "Main Content"

## Sponsors
- ExampleCorp: url=https://example.com, position=top-right, startTime=0, endTime=10
`

// ---------------------------------------------------------------------------
// 1. Happy path – complete memo
// ---------------------------------------------------------------------------
describe('parseMemoToProject – happy path', () => {
  test('returns a valid Project with no errors for a complete memo', () => {
    const { project, errors } = parseMemoToProject(VALID_MEMO)

    expect(project).not.toBeNull()
    expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0)
    expect(project!.metadata.name).toBe('My Test Project')
    expect(project!.metadata.duration).toBe(60)
    expect(project!.metadata.resolution).toEqual({ width: 1920, height: 1080 })
    expect(project!.metadata.fps).toBe(30)
    expect(project!.metadata.sampleRate).toBe(48000)
  })

  test('populates timeline correctly', () => {
    const { project } = parseMemoToProject(VALID_MEMO)
    expect(project!.timeline).toHaveLength(1)
    expect(project!.timeline[0].id).toBe('captions_main')
    expect(project!.timeline[0].clips).toHaveLength(2)
    expect(project!.timeline[0].clips[0]).toEqual({
      startTime: 0,
      endTime: 2.5,
      text: 'Hello world',
      styleId: 'default_caption',
    })
  })

  test('populates resources styles correctly', () => {
    const { project } = parseMemoToProject(VALID_MEMO)
    const styles = project!.resources.styles
    expect(styles['default_caption']).toMatchObject({
      id: 'default_caption',
      fontFamily: 'Arial',
      fontSize: 32,
      color: '#ffffff',
    })
    expect(styles['highlight_caption']).toMatchObject({
      id: 'highlight_caption',
      effect: 'typewriter',
    })
  })

  test('populates assets correctly', () => {
    const { project } = parseMemoToProject(VALID_MEMO)
    const assets = project!.assets
    expect(assets).toHaveLength(3)
    expect(assets[0]).toMatchObject({ name: 'intro_video', type: 'video', path: '/videos/intro.mp4', duration: 30 })
    expect(assets[1]).toMatchObject({ name: 'background_music', type: 'audio', path: '/audio/bg.mp3' })
    expect(assets[2]).toMatchObject({ name: 'logo', type: 'image', path: '/images/logo.png', width: 200, height: 100 })
  })

  test('populates chapters correctly', () => {
    const { project } = parseMemoToProject(VALID_MEMO)
    expect(project!.chapters).toEqual([
      { time: 0, title: 'Introduction' },
      { time: 30, title: 'Main Content' },
    ])
  })

  test('populates sponsors correctly', () => {
    const { project } = parseMemoToProject(VALID_MEMO)
    expect(project!.sponsors).toEqual([
      { name: 'ExampleCorp', url: 'https://example.com', position: 'top-right', startTime: 0, endTime: 10 },
    ])
  })

  test('sets default settings', () => {
    const { project } = parseMemoToProject(VALID_MEMO)
    expect(project!.settings).toEqual({
      theme: 'dark',
      fontFamily: 'Arial',
      accentColor: '#4a90e2',
    })
  })
})

// ---------------------------------------------------------------------------
// 2. Missing required sections
// ---------------------------------------------------------------------------
describe('parseMemoToProject – missing required sections', () => {
  test('returns error when # Project header is missing', () => {
    const memo = VALID_MEMO.replace(/^# Project:.*\n/m, '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    const err = errors.find((e) => e.message.includes('"Project"'))
    expect(err).toBeDefined()
    expect(err!.severity).toBe('error')
    expect(err!.suggestion).toBeDefined()
  })

  test('returns error when ## Timeline is missing', () => {
    const memo = VALID_MEMO.replace(/^## Timeline[\s\S]*?(?=^##)/m, '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    const err = errors.find((e) => e.message.includes('"Timeline"'))
    expect(err).toBeDefined()
    expect(err!.severity).toBe('error')
    expect(err!.suggestion).toBeDefined()
  })

  test('returns error when ## Assets is missing', () => {
    const memo = VALID_MEMO.replace(/^## Assets[\s\S]*?(?=^##)/m, '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    const err = errors.find((e) => e.message.includes('"Assets"'))
    expect(err).toBeDefined()
  })

  test('returns error when ## Chapters is missing', () => {
    const memo = VALID_MEMO.replace(/^## Chapters[\s\S]*?(?=^##)/m, '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    const err = errors.find((e) => e.message.includes('"Chapters"'))
    expect(err).toBeDefined()
  })

  test('returns error when ## Sponsors is missing', () => {
    const memo = VALID_MEMO.replace(/^## Sponsors[\s\S]*$/m, '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    const err = errors.find((e) => e.message.includes('"Sponsors"'))
    expect(err).toBeDefined()
  })

  test('lists all missing sections in a single call', () => {
    const { isValid, missingSection } = validateMemoStructure('')
    expect(isValid).toBe(false)
    expect(missingSection).toEqual(expect.arrayContaining(['Project', 'Timeline', 'Resources', 'Assets', 'Chapters', 'Sponsors']))
  })
})

// ---------------------------------------------------------------------------
// 3. Missing required fields
// ---------------------------------------------------------------------------
describe('parseMemoToProject – missing required fields', () => {
  test('returns error when Duration field is missing', () => {
    const memo = VALID_MEMO.replace(/- Duration:.*\n/, '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    expect(errors.some((e) => e.section === 'Project' && e.severity === 'error')).toBe(true)
  })

  test('returns error when Resolution field is missing', () => {
    const memo = VALID_MEMO.replace(/- Resolution:.*\n/, '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    expect(errors.some((e) => e.section === 'Project' && e.severity === 'error')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. Numeric conversion failures → defaults used
// ---------------------------------------------------------------------------
describe('parseMemoToProject – numeric conversion failures use defaults', () => {
  test('uses default FPS (30) when FPS value is not a number', () => {
    const memo = VALID_MEMO.replace('- FPS: 30', '- FPS: invalid')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).not.toBeNull()
    expect(project!.metadata.fps).toBe(30)
    expect(errors.some((e) => e.severity === 'warning' && e.section === 'Project')).toBe(true)
  })

  test('uses default SampleRate (48000) when SampleRate is omitted', () => {
    const memo = VALID_MEMO.replace('- SampleRate: 48000\n', '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).not.toBeNull()
    expect(project!.metadata.sampleRate).toBe(48000)
    expect(errors.some((e) => e.severity === 'warning' && e.section === 'Project' && e.message.includes('SampleRate'))).toBe(true)
  })

  test('uses default FPS (30) when FPS field is omitted', () => {
    const memo = VALID_MEMO.replace('- FPS: 30\n', '')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).not.toBeNull()
    expect(project!.metadata.fps).toBe(30)
    expect(errors.some((e) => e.severity === 'warning' && e.message.includes('FPS'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 5. Markdown syntax errors → error + suggestion
// ---------------------------------------------------------------------------
describe('parseMemoToProject – markdown syntax errors', () => {
  test('warns about invalid color in style definition', () => {
    const memo = VALID_MEMO.replace('color=#ffffff', 'color=notacolor')
    const { project, errors } = parseMemoToProject(memo)
    // project still builds; warning is emitted
    expect(project).not.toBeNull()
    const warn = errors.find((e) => e.severity === 'warning' && e.message.includes('color'))
    expect(warn).toBeDefined()
    expect(warn!.suggestion).toBeDefined()
  })

  test('returns error for empty Timeline (no tracks)', () => {
    const memo = VALID_MEMO.replace(/^## Timeline[\s\S]*?(?=^## Resources)/m, '## Timeline\n\n')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).toBeNull()
    const err = errors.find((e) => e.section === 'Timeline' && e.severity === 'error')
    expect(err).toBeDefined()
    expect(err!.suggestion).toBeDefined()
  })

  test('warns about invalid time range in clip', () => {
    // endTime before startTime
    const memo = VALID_MEMO.replace('[0.0-2.5]', '[5.0-1.0]')
    const { project, errors } = parseMemoToProject(memo)
    expect(project).not.toBeNull()
    expect(errors.some((e) => e.severity === 'warning' && e.message.includes('time range'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Unit tests for utility functions
// ---------------------------------------------------------------------------
describe('validateMemoStructure', () => {
  test('returns isValid=true for a complete memo', () => {
    expect(validateMemoStructure(VALID_MEMO).isValid).toBe(true)
  })

  test('detects missing sections', () => {
    const { isValid, missingSection } = validateMemoStructure('# Project: X\n- Duration: 10s\n- Resolution: 1920x1080\n')
    expect(isValid).toBe(false)
    expect(missingSection).toContain('Timeline')
  })
})

describe('extractSection', () => {
  test('extracts lines of a named section', () => {
    const lines = VALID_MEMO.split('\n')
    const section = extractSection(lines, 'Chapters')
    expect(section.some((l) => l.includes('Introduction'))).toBe(true)
  })

  test('returns empty array when section is missing', () => {
    expect(extractSection(['## Other'], 'Missing')).toEqual([])
  })
})

describe('parseKeyValueLine', () => {
  test('parses a simple key=value pair', () => {
    expect(parseKeyValueLine('fontFamily=Arial')).toEqual({ key: 'fontFamily', value: 'Arial' })
  })

  test('returns null for a non-matching string', () => {
    expect(parseKeyValueLine('not a key value')).toBeNull()
  })

  test('handles values with equals signs', () => {
    expect(parseKeyValueLine('url=https://example.com?a=1')).toEqual({
      key: 'url',
      value: 'https://example.com?a=1',
    })
  })
})

describe('parseTimeRange', () => {
  test('parses a valid time range', () => {
    expect(parseTimeRange('[0.0-2.5]')).toEqual({ start: 0, end: 2.5 })
  })

  test('returns null for invalid format', () => {
    expect(parseTimeRange('0.0-2.5')).toBeNull()
    expect(parseTimeRange('[abc-def]')).toBeNull()
  })
})

describe('parseProjectHeader', () => {
  test('parses a valid header', () => {
    const lines = VALID_MEMO.split('\n')
    const result = parseProjectHeader(lines)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('My Test Project')
    expect(result!.duration).toBe(60)
    expect(result!.resolution).toEqual({ width: 1920, height: 1080 })
    expect(result!.fps).toBe(30)
    expect(result!.sampleRate).toBe(48000)
  })

  test('returns null when header is missing', () => {
    expect(parseProjectHeader(['no header here'])).toBeNull()
  })
})

describe('parseTimeline', () => {
  test('parses tracks with clips', () => {
    const lines = [
      '### Track: main',
      '- [0.0-1.0] "Hello" | style: s1',
    ]
    const tracks = parseTimeline(lines)
    expect(tracks).not.toBeNull()
    expect(tracks![0].id).toBe('main')
    expect(tracks![0].clips[0].text).toBe('Hello')
  })

  test('returns null for empty input', () => {
    expect(parseTimeline([])).toBeNull()
  })
})

describe('parseResources', () => {
  test('parses styles sub-section', () => {
    const lines = [
      '### Styles',
      '- s1: fontFamily=Arial, fontSize=32, color=#fff',
    ]
    const styles = parseResources(lines)
    expect(styles).not.toBeNull()
    expect(styles!['s1'].fontFamily).toBe('Arial')
  })

  test('returns null for empty input', () => {
    expect(parseResources([])).toBeNull()
  })
})

describe('parseAssets', () => {
  test('parses video, audio, and image assets', () => {
    const lines = [
      '### Video',
      '- vid: path=/v.mp4, duration=10',
      '### Audio',
      '- aud: path=/a.mp3',
      '### Image',
      '- img: path=/i.png, width=100, height=50',
    ]
    const assets = parseAssets(lines)
    expect(assets).not.toBeNull()
    expect(assets).toHaveLength(3)
  })

  test('returns null for empty input', () => {
    expect(parseAssets([])).toBeNull()
  })
})

describe('parseChapters', () => {
  test('parses chapter entries', () => {
    const lines = ['- [0.0] "Intro"', '- [30.0] "Body"']
    const chapters = parseChapters(lines)
    expect(chapters).toEqual([
      { time: 0, title: 'Intro' },
      { time: 30, title: 'Body' },
    ])
  })

  test('returns null for empty input', () => {
    expect(parseChapters([])).toBeNull()
  })
})

describe('parseSponsors', () => {
  test('parses sponsor entries', () => {
    const lines = ['- Corp: url=https://corp.com, position=top, startTime=0, endTime=5']
    const sponsors = parseSponsors(lines)
    expect(sponsors).not.toBeNull()
    expect(sponsors![0]).toMatchObject({ name: 'Corp', url: 'https://corp.com', startTime: 0, endTime: 5 })
  })

  test('returns null for empty input', () => {
    expect(parseSponsors([])).toBeNull()
  })
})

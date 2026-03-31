import type {
  Project,
  Track,
  TimelineClip,
  ResourceStyles,
  CaptionStyle,
  Asset,
  Chapter,
  SponsorBanner,
} from '../../shared/types/project.types'
import type { ParserError } from './types/parserError'
import { isValidTimeRange, isValidResolution, isValidColor, isValidFPS } from './validation'

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------
const DEFAULT_FPS = 30
const DEFAULT_SAMPLE_RATE = 48000
const DEFAULT_THEME = 'dark'
const DEFAULT_FONT_FAMILY = 'Arial'
const DEFAULT_ACCENT_COLOR = '#4a90e2'

// ---------------------------------------------------------------------------
// Required sections
// ---------------------------------------------------------------------------
const REQUIRED_SECTIONS = ['Project', 'Timeline', 'Resources', 'Assets', 'Chapters', 'Sponsors']

// ---------------------------------------------------------------------------
// Public utility functions
// ---------------------------------------------------------------------------

/**
 * Validates that all required top-level sections are present in the memo text.
 */
export function validateMemoStructure(
  memoText: string,
): { isValid: boolean; missingSection: string[] } {
  const missingSections: string[] = []

  for (const section of REQUIRED_SECTIONS) {
    if (section === 'Project') {
      // Project is the H1 header
      if (!/^#\s+Project:/m.test(memoText)) {
        missingSections.push(section)
      }
    } else {
      // Other sections are H2 headers
      if (!new RegExp(`^##\\s+${section}`, 'm').test(memoText)) {
        missingSections.push(section)
      }
    }
  }

  return { isValid: missingSections.length === 0, missingSection: missingSections }
}

/**
 * Extracts the lines belonging to a named H2 section (## SectionName).
 * Lines are returned up to (but not including) the next H2 section.
 */
export function extractSection(lines: string[], sectionName: string): string[] {
  const headerPattern = new RegExp(`^##\\s+${sectionName}\\s*$`)
  const startIdx = lines.findIndex((l) => headerPattern.test(l))
  if (startIdx === -1) return []

  const result: string[] = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break
    result.push(lines[i])
  }
  return result
}

/**
 * Parses a `key=value` pair from a string fragment.
 * Returns null if the line does not match the expected format.
 */
export function parseKeyValueLine(line: string): { key: string; value: string } | null {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (!match) return null
  return { key: match[1].trim(), value: match[2].trim() }
}

/**
 * Parses a `[startTime-endTime]` time range string.
 * Returns null if parsing fails.
 */
export function parseTimeRange(timeRange: string): { start: number; end: number } | null {
  const match = timeRange.match(/^\[(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\]$/)
  if (!match) return null
  const start = parseFloat(match[1])
  const end = parseFloat(match[2])
  if (isNaN(start) || isNaN(end)) return null
  return { start, end }
}

// ---------------------------------------------------------------------------
// Section parsers
// ---------------------------------------------------------------------------

/**
 * Parses the project header from the H1 `# Project:` block and its
 * immediately following bullet list.
 */
export function parseProjectHeader(
  lines: string[],
): {
  name: string
  duration: number
  resolution: { width: number; height: number }
  fps: number
  sampleRate: number
} | null {
  const headerLine = lines.find((l) => /^#\s+Project:/.test(l))
  if (!headerLine) return null

  const name = headerLine.replace(/^#\s+Project:\s*/, '').trim()

  // Collect bullet lines that follow the header up to the next # section
  const headerIdx = lines.indexOf(headerLine)
  const bullets: string[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (/^#/.test(lines[i])) break
    const m = lines[i].match(/^-\s+(.+)$/)
    if (m) bullets.push(m[1].trim())
  }

  // Parse bullet key: value pairs
  const fields: Record<string, string> = {}
  for (const b of bullets) {
    const kv = b.match(/^(\w+):\s*(.+)$/)
    if (kv) fields[kv[1].toLowerCase()] = kv[2].trim()
  }

  // Duration
  let duration = NaN
  if (fields['duration']) {
    duration = parseFloat(fields['duration'].replace(/s$/i, ''))
  }
  if (isNaN(duration)) return null

  // Resolution
  const resMatch = fields['resolution']?.match(/^(\d+)x(\d+)$/)
  if (!resMatch) return null
  const width = parseInt(resMatch[1], 10)
  const height = parseInt(resMatch[2], 10)

  // FPS (optional)
  let fps = DEFAULT_FPS
  if (fields['fps']) {
    const parsed = parseFloat(fields['fps'])
    fps = isNaN(parsed) ? DEFAULT_FPS : parsed
  }

  // SampleRate (optional)
  let sampleRate = DEFAULT_SAMPLE_RATE
  if (fields['samplerate']) {
    const parsed = parseInt(fields['samplerate'], 10)
    sampleRate = isNaN(parsed) ? DEFAULT_SAMPLE_RATE : parsed
  }

  return { name, duration, resolution: { width, height }, fps, sampleRate }
}

/**
 * Parses the `## Timeline` section into an array of Track objects.
 */
export function parseTimeline(lines: string[]): Track[] | null {
  if (lines.length === 0) return null

  const tracks: Track[] = []
  let currentTrack: Track | null = null

  for (const line of lines) {
    const trackMatch = line.match(/^###\s+Track:\s*(.+)$/)
    if (trackMatch) {
      if (currentTrack) tracks.push(currentTrack)
      currentTrack = { id: trackMatch[1].trim(), clips: [] }
      continue
    }

    if (currentTrack) {
      // - [start-end] "text" | style: styleId
      const clipMatch = line.match(
        /^-\s+(\[\d+(?:\.\d+)?-\d+(?:\.\d+)?\])\s+"([^"]*)"\s*\|\s*style:\s*(.+)$/,
      )
      if (clipMatch) {
        const timeRange = parseTimeRange(clipMatch[1])
        if (timeRange) {
          const clip: TimelineClip = {
            startTime: timeRange.start,
            endTime: timeRange.end,
            text: clipMatch[2],
            styleId: clipMatch[3].trim(),
          }
          currentTrack.clips.push(clip)
        }
      }
    }
  }

  if (currentTrack) tracks.push(currentTrack)
  return tracks.length > 0 ? tracks : null
}

/**
 * Parses the `## Resources` section (specifically `### Styles` sub-section).
 */
export function parseResources(lines: string[]): ResourceStyles | null {
  if (lines.length === 0) return null

  const styles: ResourceStyles = {}
  let inStyles = false

  for (const line of lines) {
    if (/^###\s+Styles\s*$/.test(line)) {
      inStyles = true
      continue
    }
    if (/^###/.test(line)) {
      inStyles = false
      continue
    }

    if (inStyles) {
      // - styleId: key=value, key=value, ...
      const styleMatch = line.match(/^-\s+(\S+):\s+(.+)$/)
      if (styleMatch) {
        const styleId = styleMatch[1]
        const pairs = styleMatch[2].split(',').map((s) => s.trim())
        const style: CaptionStyle = { id: styleId }
        for (const pair of pairs) {
          const kv = parseKeyValueLine(pair)
          if (!kv) continue
          switch (kv.key.toLowerCase()) {
            case 'fontfamily':
              style.fontFamily = kv.value
              break
            case 'fontsize':
              style.fontSize = parseInt(kv.value, 10)
              break
            case 'color':
              style.color = kv.value
              break
            case 'effect':
              style.effect = kv.value
              break
          }
        }
        styles[styleId] = style
      }
    }
  }

  return Object.keys(styles).length > 0 ? styles : null
}

/**
 * Parses the `## Assets` section into an array of Asset objects.
 */
export function parseAssets(lines: string[]): Asset[] | null {
  if (lines.length === 0) return null

  const assets: Asset[] = []
  let currentType: 'video' | 'audio' | 'image' | null = null

  for (const line of lines) {
    const typeMatch = line.match(/^###\s+(Video|Audio|Image)\s*$/i)
    if (typeMatch) {
      currentType = typeMatch[1].toLowerCase() as 'video' | 'audio' | 'image'
      continue
    }

    if (currentType) {
      // - assetName: key=value, key=value, ...
      const assetMatch = line.match(/^-\s+(\S+):\s+(.+)$/)
      if (assetMatch) {
        const name = assetMatch[1]
        const pairs = assetMatch[2].split(',').map((s) => s.trim())
        const asset: Asset = { name, type: currentType, path: '' }
        for (const pair of pairs) {
          const kv = parseKeyValueLine(pair)
          if (!kv) continue
          switch (kv.key.toLowerCase()) {
            case 'path':
              asset.path = kv.value
              break
            case 'duration':
              asset.duration = parseFloat(kv.value)
              break
            case 'width':
              asset.width = parseInt(kv.value, 10)
              break
            case 'height':
              asset.height = parseInt(kv.value, 10)
              break
          }
        }
        assets.push(asset)
      }
    }
  }

  return assets.length > 0 ? assets : null
}

/**
 * Parses the `## Chapters` section.
 */
export function parseChapters(lines: string[]): Chapter[] | null {
  if (lines.length === 0) return null

  const chapters: Chapter[] = []

  for (const line of lines) {
    // - [time] "title"
    const m = line.match(/^-\s+\[(\d+(?:\.\d+)?)\]\s+"([^"]*)"$/)
    if (m) {
      chapters.push({ time: parseFloat(m[1]), title: m[2] })
    }
  }

  return chapters.length > 0 ? chapters : null
}

/**
 * Parses the `## Sponsors` section.
 */
export function parseSponsors(lines: string[]): SponsorBanner[] | null {
  if (lines.length === 0) return null

  const sponsors: SponsorBanner[] = []

  for (const line of lines) {
    // - sponsorName: key=value, key=value, ...
    const sponsorMatch = line.match(/^-\s+(\S+):\s+(.+)$/)
    if (sponsorMatch) {
      const name = sponsorMatch[1]
      const pairs = sponsorMatch[2].split(',').map((s) => s.trim())
      const sponsor: Partial<SponsorBanner> & { name: string } = { name }
      for (const pair of pairs) {
        const kv = parseKeyValueLine(pair)
        if (!kv) continue
        switch (kv.key.toLowerCase()) {
          case 'url':
            sponsor.url = kv.value
            break
          case 'position':
            sponsor.position = kv.value
            break
          case 'starttime':
            sponsor.startTime = parseFloat(kv.value)
            break
          case 'endtime':
            sponsor.endTime = parseFloat(kv.value)
            break
        }
      }
      if (
        sponsor.url !== undefined &&
        sponsor.position !== undefined &&
        sponsor.startTime !== undefined &&
        sponsor.endTime !== undefined
      ) {
        sponsors.push(sponsor as SponsorBanner)
      }
    }
  }

  return sponsors.length > 0 ? sponsors : null
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Parses a markdown memo string into a `Project` object.
 *
 * Returns both the project (or null on fatal error) and an array of
 * `ParserError` objects describing any issues found during parsing.
 */
export function parseMemoToProject(
  memoText: string,
): { project: Project | null; errors: ParserError[] } {
  const errors: ParserError[] = []

  // -----------------------------------------------------------------------
  // Structural validation
  // -----------------------------------------------------------------------
  const { isValid, missingSection } = validateMemoStructure(memoText)
  if (!isValid) {
    for (const section of missingSection) {
      errors.push({
        severity: 'error',
        section: 'Structure',
        message: `Required section "${section}" is missing.`,
        suggestion:
          section === 'Project'
            ? 'Add a line starting with "# Project: <name>" at the top of the memo.'
            : `Add a "## ${section}" section to the memo.`,
      })
    }
    return { project: null, errors }
  }

  const lines = memoText.split('\n')

  // -----------------------------------------------------------------------
  // Project header
  // -----------------------------------------------------------------------
  const header = parseProjectHeader(lines)
  if (!header) {
    errors.push({
      severity: 'error',
      section: 'Project',
      message: 'Failed to parse the project header.',
      suggestion:
        'Ensure the header contains "- Duration: <number>s" and "- Resolution: <width>x<height>".',
    })
    return { project: null, errors }
  }

  // Validate resolution
  if (!isValidResolution(header.resolution.width, header.resolution.height)) {
    errors.push({
      severity: 'error',
      section: 'Project',
      message: `Invalid resolution "${header.resolution.width}x${header.resolution.height}".`,
      suggestion: 'Resolution values must be positive integers, e.g. "1920x1080".',
    })
    return { project: null, errors }
  }

  // Warn if FPS was defaulted
  const rawLines = lines.join('\n')
  const fpsLineMatch = rawLines.match(/^\s*-\s+FPS:\s*(.+)$/im)
  if (!fpsLineMatch) {
    errors.push({
      severity: 'warning',
      section: 'Project',
      message: `FPS not specified; using default value of ${DEFAULT_FPS}.`,
      suggestion: 'Add "- FPS: <value>" under the project header to set a custom frame rate.',
    })
  } else {
    const rawFps = parseFloat(fpsLineMatch[1])
    if (isNaN(rawFps) || !isValidFPS(rawFps)) {
      errors.push({
        severity: 'warning',
        section: 'Project',
        message: `Invalid FPS value "${fpsLineMatch[1].trim()}"; using default value of ${DEFAULT_FPS}.`,
        suggestion: 'FPS must be a positive number no greater than 240.',
      })
      header.fps = DEFAULT_FPS
    }
  }

  // Warn if SampleRate was defaulted
  if (!/^\s*-\s+SampleRate:/im.test(rawLines)) {
    errors.push({
      severity: 'warning',
      section: 'Project',
      message: `SampleRate not specified; using default value of ${DEFAULT_SAMPLE_RATE}.`,
      suggestion:
        'Add "- SampleRate: <value>" under the project header to set a custom sample rate.',
    })
  }

  // -----------------------------------------------------------------------
  // Timeline
  // -----------------------------------------------------------------------
  const timelineLines = extractSection(lines, 'Timeline')
  const timeline = parseTimeline(timelineLines)
  if (!timeline) {
    errors.push({
      severity: 'error',
      section: 'Timeline',
      message: 'The "## Timeline" section is empty or contains no valid tracks.',
      suggestion:
        'Add at least one "### Track: <id>" sub-section with clip lines in the format:\n' +
        '  - [startTime-endTime] "text" | style: styleId',
    })
    return { project: null, errors }
  }

  // Validate clip time ranges
  for (const track of timeline) {
    for (const clip of track.clips) {
      if (!isValidTimeRange(clip.startTime, clip.endTime)) {
        errors.push({
          severity: 'warning',
          section: 'Timeline',
          message: `Invalid time range [${clip.startTime}-${clip.endTime}] in track "${track.id}".`,
          suggestion: 'Ensure startTime >= 0 and endTime > startTime.',
        })
      }
    }
  }

  // -----------------------------------------------------------------------
  // Resources
  // -----------------------------------------------------------------------
  const resourceLines = extractSection(lines, 'Resources')
  const styles = parseResources(resourceLines)
  if (!styles) {
    errors.push({
      severity: 'error',
      section: 'Resources',
      message: 'The "## Resources" section contains no valid styles.',
      suggestion:
        'Add a "### Styles" sub-section with lines in the format:\n' +
        '  - styleId: fontFamily=Arial, fontSize=32, color=#ffffff',
    })
    return { project: null, errors }
  }

  // Validate colors
  for (const [id, style] of Object.entries(styles)) {
    if (style.color && !isValidColor(style.color)) {
      errors.push({
        severity: 'warning',
        section: 'Resources',
        message: `Style "${id}" has an invalid color value "${style.color}".`,
        suggestion: 'Color must be a valid CSS hex string such as "#ffffff" or "#fff".',
      })
    }
  }

  // -----------------------------------------------------------------------
  // Assets
  // -----------------------------------------------------------------------
  const assetLines = extractSection(lines, 'Assets')
  const assets = parseAssets(assetLines)
  if (!assets) {
    errors.push({
      severity: 'error',
      section: 'Assets',
      message: 'The "## Assets" section is empty or contains no valid assets.',
      suggestion:
        'Add asset sub-sections (### Video, ### Audio, ### Image) with lines in the format:\n' +
        '  - assetName: path=/path/to/file',
    })
    return { project: null, errors }
  }

  // -----------------------------------------------------------------------
  // Chapters
  // -----------------------------------------------------------------------
  const chapterLines = extractSection(lines, 'Chapters')
  const chapters = parseChapters(chapterLines)
  if (!chapters) {
    errors.push({
      severity: 'error',
      section: 'Chapters',
      message: 'The "## Chapters" section is empty or contains no valid chapter entries.',
      suggestion: 'Add chapter lines in the format:\n  - [timeInSeconds] "Chapter Title"',
    })
    return { project: null, errors }
  }

  // -----------------------------------------------------------------------
  // Sponsors
  // -----------------------------------------------------------------------
  const sponsorLines = extractSection(lines, 'Sponsors')
  const sponsors = parseSponsors(sponsorLines)
  if (!sponsors) {
    errors.push({
      severity: 'error',
      section: 'Sponsors',
      message: 'The "## Sponsors" section is empty or contains no valid sponsor entries.',
      suggestion:
        'Add sponsor lines in the format:\n' +
        '  - sponsorName: url=https://example.com, position=top-right, startTime=0, endTime=30',
    })
    return { project: null, errors }
  }

  // -----------------------------------------------------------------------
  // Assemble project
  // -----------------------------------------------------------------------
  const project: Project = {
    schemaVersion: '1.0.0',
    metadata: {
      name: header.name,
      duration: header.duration,
      resolution: header.resolution,
      fps: header.fps,
      sampleRate: header.sampleRate,
    },
    settings: {
      theme: DEFAULT_THEME,
      fontFamily: DEFAULT_FONT_FAMILY,
      accentColor: DEFAULT_ACCENT_COLOR,
    },
    timeline,
    resources: { styles },
    assets,
    chapters,
    sponsors,
  }

  return { project, errors }
}

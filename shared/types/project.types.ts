export interface Asset {
  name: string
  type: 'video' | 'audio' | 'image'
  path: string
  duration?: number
  width?: number
  height?: number
}

export interface CaptionStyle {
  id: string
  fontFamily?: string
  fontSize?: number
  color?: string
  effect?: string
}

export type ResourceStyles = Record<string, CaptionStyle>

export interface TimelineClip {
  startTime: number
  endTime: number
  text: string
  styleId: string
}

export interface Track {
  id: string
  clips: TimelineClip[]
}

export interface Chapter {
  time: number
  title: string
}

export interface SponsorBanner {
  name: string
  url: string
  position: string
  startTime: number
  endTime: number
}

export interface ProjectMetadata {
  name: string
  duration: number
  resolution: {
    width: number
    height: number
  }
  fps: number
  sampleRate: number
}

export interface ProjectSettings {
  theme: string
  fontFamily: string
  accentColor: string
}

export interface Project {
  schemaVersion: string
  metadata: ProjectMetadata
  settings: ProjectSettings
  timeline: Track[]
  resources: {
    styles: ResourceStyles
  }
  assets: Asset[]
  chapters: Chapter[]
  sponsors: SponsorBanner[]
}

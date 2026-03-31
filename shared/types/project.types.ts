// ============================================================
// shared/types/project.types.ts
// Type definitions for the Big Video Editing Studio JSON builder
// ============================================================

/** Schema version for forward/backward compatibility */
export type SchemaVersion = string;

// ── Asset ─────────────────────────────────────────────────────────────────

/** Supported asset types */
export type AssetType = "video" | "audio" | "image";

/** A raw media asset referenced in the project */
export interface Asset {
  /** Unique identifier for the asset */
  id: string;
  /** Human-readable name */
  name: string;
  /** File path or URL to the source file */
  src: string;
  /** Asset type */
  type: AssetType;
  /** Duration in seconds (for video/audio) */
  duration?: number;
  /** Width in pixels (for video/image) */
  width?: number;
  /** Height in pixels (for video/image) */
  height?: number;
  /** Additional arbitrary metadata */
  metadata?: Record<string, unknown>;
}

// ── Caption / Styling ──────────────────────────────────────────────────────

/** Visual effect applied to a caption */
export type CaptionEffect = "none" | "typewriter" | "fade" | "slide" | string;

/** Reusable caption style definition stored in resources.styles */
export interface CaptionStyle {
  /** Font family name */
  fontFamily?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Text colour (CSS colour string, e.g. "#ffffff") */
  color?: string;
  /** Border / outline colour */
  borderColor?: string;
  /** Animation / visual effect */
  effect?: CaptionEffect;
  /** Background opacity (0–1) */
  bgOpacity?: number;
  /** Background colour */
  bgColor?: string;
  /** Bold text */
  bold?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Additional arbitrary style properties */
  [key: string]: unknown;
}

/** Dictionary of named caption styles */
export type ResourceStyles = Record<string, CaptionStyle>;

// ── Timeline Clips ────────────────────────────────────────────────────────

/** A generic clip placed on a video/audio/overlay track */
export interface TimelineClip {
  /** Unique identifier for the clip */
  id?: string;
  /** Reference to an Asset id */
  assetId?: string;
  /** Start time on the timeline (seconds) */
  start: number;
  /** End time on the timeline (seconds) */
  end: number;
  /** In-point within the source asset (seconds) */
  inPoint?: number;
  /** Out-point within the source asset (seconds) */
  outPoint?: number;
  /** Playback speed multiplier */
  speed?: number;
  /** Opacity (0–1) */
  opacity?: number;
  /** Arbitrary clip-level properties */
  [key: string]: unknown;
}

/** A caption clip placed on a caption track, supporting styleId reference */
export interface CaptionClip {
  /** Unique identifier for the clip */
  id?: string;
  /** Start time on the timeline (seconds) */
  start: number;
  /** End time on the timeline (seconds) */
  end: number;
  /** Caption display text */
  text: string;
  /**
   * Reference to a key in resources.styles.
   * When set, visual properties are inherited from the named style.
   */
  styleId?: string;
  /** Inline style overrides (merged on top of styleId style) */
  style?: Partial<CaptionStyle>;
}

// ── Caption (standalone, for resources or simple lists) ───────────────────

/** A caption entry with full text, timing and optional styleId reference */
export interface Caption {
  /** Unique identifier */
  id?: string;
  /** Start time (seconds) */
  start: number;
  /** End time (seconds) */
  end: number;
  /** Caption text */
  text: string;
  /** Reference to a key in resources.styles */
  styleId?: string;
  /** Inline style overrides */
  style?: Partial<CaptionStyle>;
}

// ── Chapter ───────────────────────────────────────────────────────────────

/** A named chapter / section marker on the timeline */
export interface Chapter {
  /** Unique identifier */
  id?: string;
  /** Chapter title */
  title: string;
  /** Start time (seconds) */
  start: number;
  /** End time (seconds, optional) */
  end?: number;
}

// ── Sponsor Banner ────────────────────────────────────────────────────────

/** A sponsor banner overlay */
export interface SponsorBanner {
  /** Unique identifier */
  id?: string;
  /** Sponsor name */
  sponsorName: string;
  /** Banner image URL or path */
  imageUrl?: string;
  /** Link URL */
  linkUrl?: string;
  /** Start time on the timeline (seconds) */
  start: number;
  /** End time on the timeline (seconds) */
  end: number;
  /** CSS-style position / size information */
  layout?: Partial<LayoutConfig>;
}

// ── Layout / Overlay ──────────────────────────────────────────────────────

/** Position and size configuration for overlay elements */
export interface LayoutConfig {
  /** X position (pixels or percentage string, e.g. "10%" or 100) */
  x?: number | string;
  /** Y position */
  y?: number | string;
  /** Width */
  width?: number | string;
  /** Height */
  height?: number | string;
  /** CSS z-index */
  zIndex?: number;
  /** Alignment anchor */
  align?: "left" | "center" | "right";
  /** Vertical alignment anchor */
  verticalAlign?: "top" | "middle" | "bottom";
}

// ── Track ─────────────────────────────────────────────────────────────────

/** Supported track types */
export type TrackType = "video" | "audio" | "caption" | "overlay";

/** A track in the timeline */
export interface Track {
  /** Unique identifier */
  id: string;
  /** Track type */
  type: TrackType;
  /** Human-readable label */
  label?: string;
  /** Whether the track is muted */
  muted?: boolean;
  /** Whether the track is locked for editing */
  locked?: boolean;
  /** Clips placed on the track (video/audio/overlay use TimelineClip; caption tracks use CaptionClip) */
  clips: Array<TimelineClip | CaptionClip>;
}

// ── Project Settings ──────────────────────────────────────────────────────

/** Video export preset */
export interface ExportPreset {
  /** Preset name (e.g. "YouTube 1080p") */
  name: string;
  /** Output width (pixels) */
  width: number;
  /** Output height (pixels) */
  height: number;
  /** Frames per second */
  fps: number;
  /** Video bitrate in kbps */
  videoBitrate?: number;
  /** Audio bitrate in kbps */
  audioBitrate?: number;
  /** Output container format (e.g. "mp4") */
  format?: string;
}

/** Global project settings */
export interface ProjectSettings {
  /** Canvas / output width in pixels */
  width: number;
  /** Canvas / output height in pixels */
  height: number;
  /** Frames per second */
  fps: number;
  /** Total project duration in seconds (auto-calculated if omitted) */
  duration?: number;
  /** Sample rate for audio (Hz) */
  sampleRate?: number;
  /** Background colour */
  backgroundColor?: string;
}

// ── Project Metadata ──────────────────────────────────────────────────────

/** Human-readable metadata about the project */
export interface ProjectMetadata {
  /** Project title */
  title?: string;
  /** Short description */
  description?: string;
  /** Author name */
  author?: string;
  /** ISO 8601 creation timestamp */
  createdAt?: string;
  /** ISO 8601 last-modified timestamp */
  updatedAt?: string;
  /** Arbitrary tags */
  tags?: string[];
  /** Thumbnail image URL or path */
  thumbnail?: string;
}

// ── Resources ─────────────────────────────────────────────────────────────

/** Shared resources used across the project */
export interface ProjectResources {
  /** Named assets keyed by asset id */
  assets?: Record<string, Asset>;
  /** Named caption styles keyed by style id */
  styles: ResourceStyles;
  /** Named export presets */
  exportPresets?: Record<string, ExportPreset>;
}

// ── Timeline ─────────────────────────────────────────────────────────────

/** The main timeline containing all tracks */
export interface Timeline {
  /** Ordered list of tracks */
  tracks: Track[];
  /** Named chapter markers */
  chapters?: Chapter[];
  /** Sponsor banners */
  sponsorBanners?: SponsorBanner[];
}

// ── Root Project Manifest ─────────────────────────────────────────────────

/**
 * Root project manifest.
 *
 * A single JSON file that contains all project data:
 * metadata, settings, resources (styles, assets) and the full timeline.
 */
export interface Project {
  /** Schema version for compatibility management */
  schemaVersion: SchemaVersion;
  /** Machine-friendly project identifier */
  name: string;
  /** Semver project version */
  version: string;
  /** Human-readable metadata */
  projectMetadata?: ProjectMetadata;
  /** Global render / playback settings */
  settings: ProjectSettings;
  /** Shared resources (styles, assets, export presets) */
  resources: ProjectResources;
  /** The main editing timeline */
  timeline: Timeline;
}

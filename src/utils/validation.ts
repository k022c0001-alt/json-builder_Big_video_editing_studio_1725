/**
 * Validates that a time range is valid (start < end and both non-negative).
 */
export function isValidTimeRange(start: number, end: number): boolean {
  return Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end > start
}

/**
 * Validates that a resolution is valid (positive integers).
 */
export function isValidResolution(width: number, height: number): boolean {
  return (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width > 0 &&
    height > 0
  )
}

/**
 * Validates a CSS hex color string (e.g. #fff, #ffffff, #ffffffff).
 */
export function isValidColor(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)
}

/** Maximum supported frames per second. */
export const MAX_FPS = 240

/**
 * Validates that a frames-per-second value is within a sensible range.
 */
export function isValidFPS(fps: number): boolean {
  return Number.isFinite(fps) && fps > 0 && fps <= MAX_FPS
}

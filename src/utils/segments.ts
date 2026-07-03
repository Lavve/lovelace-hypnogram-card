import type { ProcessedSleepHistory, SleepSegment } from '@/types'

export function buildSleepSegments(
  history: ProcessedSleepHistory,
): SleepSegment[] {
  const { points, periodEnd } = history
  if (points.length === 0) return []

  const periodEndMs = periodEnd.getTime()
  const segments: SleepSegment[] = []

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const nextPoint = points[i + 1]
    const startMs = point.timestamp.getTime()
    const endMs = nextPoint ? nextPoint.timestamp.getTime() : periodEndMs

    if (endMs <= startMs) continue

    segments.push({
      state: point.state,
      level: point.level,
      startMs,
      endMs,
    })
  }

  return segments
}

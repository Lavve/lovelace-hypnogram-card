import type { ProcessedSleepHistory, SleepSegment } from '@/types'

export function buildSleepSegments(
  history: ProcessedSleepHistory,
): SleepSegment[] {
  const { points, periodEnd } = history
  if (points.length === 0) return []

  const segments: SleepSegment[] = []

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const nextPoint = points[i + 1]
    const endTime = nextPoint ? nextPoint.timestamp : periodEnd

    if (endTime.getTime() <= point.timestamp.getTime()) continue

    segments.push({
      state: point.state,
      level: point.level,
      startTime: point.timestamp,
      endTime,
    })
  }

  return segments
}

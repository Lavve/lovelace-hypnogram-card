import { CHART_CONFIG } from '@/const'
import type { ProcessedSleepHistory, SleepPhase, SleepSegment } from '@/types'

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

function mergeAdjacentSegments(segments: SleepSegment[]): SleepSegment[] {
  if (segments.length === 0) return []

  const merged: SleepSegment[] = [{ ...segments[0] }]

  for (let i = 1; i < segments.length; i++) {
    const previous = merged[merged.length - 1]
    const current = segments[i]

    if (current.state === previous.state) {
      previous.endMs = current.endMs
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}

export function bucketSleepSegments(
  segments: SleepSegment[],
  periodStartMs: number,
  periodEndMs: number,
  bucketMinutes: number = CHART_CONFIG.bucketMinutes,
): SleepSegment[] {
  if (segments.length === 0 || periodEndMs <= periodStartMs) return []

  const bucketMs = bucketMinutes * 60 * 1000
  const buckets: SleepSegment[] = []

  for (
    let bucketStart = periodStartMs;
    bucketStart < periodEndMs;
    bucketStart += bucketMs
  ) {
    const bucketEnd = Math.min(bucketStart + bucketMs, periodEndMs)
    const phaseDurations = new Map<
      string,
      { level: number; duration: number }
    >()

    for (const segment of segments) {
      const overlapStart = Math.max(segment.startMs, bucketStart)
      const overlapEnd = Math.min(segment.endMs, bucketEnd)
      if (overlapEnd <= overlapStart) continue

      const duration = overlapEnd - overlapStart
      const existing = phaseDurations.get(segment.state)

      if (existing) {
        existing.duration += duration
      } else {
        phaseDurations.set(segment.state, {
          level: segment.level,
          duration,
        })
      }
    }

    if (phaseDurations.size === 0) continue

    let dominant = { state: '', level: 0, duration: 0 }

    for (const [state, { level, duration }] of phaseDurations) {
      if (duration > dominant.duration) {
        dominant = { state, level, duration }
      }
    }

    buckets.push({
      state: dominant.state,
      level: dominant.level,
      startMs: bucketStart,
      endMs: bucketEnd,
    })
  }

  return mergeAdjacentSegments(buckets)
}

export function calculatePhasePercentages(
  segments: SleepSegment[],
): Record<SleepPhase, number> | undefined {
  const durations: Record<SleepPhase, number> = {
    deep_sleep: 0,
    light_sleep: 0,
    rem: 0,
    awake: 0,
  }

  let totalMs = 0
  for (const segment of segments) {
    const duration = Math.max(0, segment.endMs - segment.startMs)
    if (!(segment.state in durations)) continue
    durations[segment.state as SleepPhase] += duration
    totalMs += duration
  }

  if (totalMs === 0) {
    return undefined
  }

  return {
    deep_sleep: Math.round((durations.deep_sleep / totalMs) * 100),
    light_sleep: Math.round((durations.light_sleep / totalMs) * 100),
    rem: Math.round((durations.rem / totalMs) * 100),
    awake: Math.round((durations.awake / totalMs) * 100),
  }
}

import type { HomeAssistant } from 'custom-card-helpers'
import { PHASE_LEVELS } from '@/const'
import type {
  HistoryState,
  ProcessedSleepHistory,
  SleepDataPoint,
} from '@/types'

export async function fetchSleepHistory(
  hass: HomeAssistant,
  entityId: string,
  hoursAgo = 24,
): Promise<HistoryState[]> {
  const startTime = new Date(
    Date.now() - hoursAgo * 60 * 60 * 1000,
  ).toISOString()

  try {
    const response = await hass.callWS<Record<string, HistoryState[]>>({
      type: 'history/history_during_period',
      start_time: startTime,
      entity_ids: [entityId],
      no_attributes: true,
    })

    if (!response?.[entityId]) {
      return []
    }

    const rawData = response[entityId]
    return Array.isArray(rawData) ? rawData : []
  } catch (error) {
    console.error('Failed to fetch sleep history from HA WebSocket API:', error)
    return []
  }
}

export function processSleepHistory(
  rawHistory: HistoryState[],
): ProcessedSleepHistory {
  const empty: ProcessedSleepHistory = {
    points: [],
    periodStart: new Date(),
    periodEnd: new Date(),
  }

  if (rawHistory.length === 0) return empty

  const sortedPoints = [...rawHistory]
    .map((p) => ({
      state: p.s,
      timestamp: new Date(p.t * 1000),
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  let startIndex = sortedPoints.findIndex(
    (p) => p.state === 'sleep_tracking_started',
  )
  let stopIndex = sortedPoints
    .map((p) => p.state)
    .lastIndexOf('sleep_tracking_stopped')

  if (startIndex === -1) startIndex = 0
  if (stopIndex === -1 || stopIndex <= startIndex)
    stopIndex = sortedPoints.length - 1

  const sleepPeriod = sortedPoints.slice(startIndex, stopIndex + 1)
  const periodStart = sleepPeriod[0].timestamp
  const periodEnd = sleepPeriod[sleepPeriod.length - 1].timestamp

  const points: SleepDataPoint[] = []

  for (const point of sleepPeriod) {
    if (point.state in PHASE_LEVELS) {
      points.push({
        state: point.state,
        level: PHASE_LEVELS[point.state],
        timestamp: point.timestamp,
      })
    }
  }

  return { points, periodStart, periodEnd }
}

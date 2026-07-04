import type { HomeAssistant } from 'custom-card-helpers'
import { PHASE_LEVELS, SLEEP_AS_ANDROID } from '@/const'
import type {
  HistoryState,
  HypnogramCardStateMapping,
  ProcessedSleepHistory,
  SleepDataPoint,
} from '@/types'

function reverseStateMapping(
  stateMapping: HypnogramCardStateMapping,
): Record<string, string> {
  const reverse: Record<string, string> = {}
  for (const [phase, entityState] of Object.entries(stateMapping)) {
    reverse[entityState] = phase
  }
  return reverse
}

function normalizeHistoryState(
  entry: HistoryState & { state?: string; last_changed?: string },
  reverseMapping: Record<string, string>,
): { state: string; timestamp: Date } | null {
  const rawState = entry.s ?? entry.state
  if (!rawState) return null

  const seconds =
    entry.lc ??
    entry.lu ??
    (entry.last_changed
      ? new Date(entry.last_changed).getTime() / 1000
      : undefined)
  if (seconds === undefined) return null

  return {
    state: reverseMapping[rawState] ?? rawState,
    timestamp: new Date(seconds * 1000),
  }
}

function isPhaseState(state: string): boolean {
  return state in PHASE_LEVELS
}

function findSleepWindow(sortedPoints: { state: string; timestamp: Date }[]): {
  startIndex: number
  stopIndex: number
} {
  let startIndex = -1
  for (let i = sortedPoints.length - 1; i >= 0; i--) {
    if (sortedPoints[i].state === SLEEP_AS_ANDROID.tracking.started) {
      startIndex = i
      break
    }
  }

  if (startIndex === -1) {
    const firstPhaseIndex = sortedPoints.findIndex((p) => isPhaseState(p.state))
    if (firstPhaseIndex === -1) {
      return { startIndex: 0, stopIndex: sortedPoints.length - 1 }
    }

    const lastStopBeforePhases = sortedPoints
      .slice(0, firstPhaseIndex)
      .map((p) => p.state)
      .lastIndexOf(SLEEP_AS_ANDROID.tracking.stopped)

    if (lastStopBeforePhases !== -1) {
      return {
        startIndex: lastStopBeforePhases + 1,
        stopIndex: sortedPoints.length - 1,
      }
    }

    return { startIndex: firstPhaseIndex, stopIndex: sortedPoints.length - 1 }
  }

  let stopIndex = sortedPoints.findIndex(
    (p, i) => i > startIndex && p.state === SLEEP_AS_ANDROID.tracking.stopped,
  )
  if (stopIndex === -1) stopIndex = sortedPoints.length - 1

  return { startIndex, stopIndex }
}

export async function fetchSleepHistory(
  hass: HomeAssistant,
  entityId: string,
  hoursAgo = 48,
): Promise<HistoryState[]> {
  const startTime = new Date(
    Date.now() - hoursAgo * 60 * 60 * 1000,
  ).toISOString()

  try {
    const response = await hass.callWS<Record<string, HistoryState[]>>({
      type: 'history/history_during_period',
      start_time: startTime,
      entity_ids: [entityId],
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    })

    if (!(entityId in response)) {
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
  stateMapping: HypnogramCardStateMapping,
): ProcessedSleepHistory {
  const empty: ProcessedSleepHistory = {
    points: [],
    periodStart: new Date(),
    periodEnd: new Date(),
  }

  if (rawHistory.length === 0) return empty

  const reverseMapping = reverseStateMapping(stateMapping)

  const sortedPoints = rawHistory
    .map((entry) => normalizeHistoryState(entry, reverseMapping))
    .filter(
      (point): point is { state: string; timestamp: Date } => point !== null,
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  if (sortedPoints.length === 0) return empty

  const { startIndex, stopIndex } = findSleepWindow(sortedPoints)
  let sleepPeriod = sortedPoints.slice(startIndex, stopIndex + 1)

  let points: SleepDataPoint[] = sleepPeriod
    .filter((point) => isPhaseState(point.state))
    .map((point) => ({
      state: point.state,
      level: PHASE_LEVELS[point.state],
      timestamp: point.timestamp,
    }))

  if (points.length === 0) {
    points = sortedPoints
      .filter((point) => isPhaseState(point.state))
      .map((point) => ({
        state: point.state,
        level: PHASE_LEVELS[point.state],
        timestamp: point.timestamp,
      }))
    sleepPeriod = sortedPoints
  }

  if (points.length === 0) return empty

  const periodStart = points[0].timestamp
  const periodEnd =
    sleepPeriod[sleepPeriod.length - 1]?.timestamp ??
    points[points.length - 1].timestamp

  return { points, periodStart, periodEnd }
}

import type { HomeAssistant } from 'custom-card-helpers'
import { PHASE_LEVELS, SLEEP_AS_ANDROID } from '@/const'
import type {
  HistoryFetchReport,
  HistoryProcessReport,
  HistoryState,
  HypnogramCardStateMapping,
  ProcessedSleepHistory,
  SleepDataPoint,
} from '@/types'
import { uniqueRawStates } from '@/utils/debug'

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
  report?: HistoryFetchReport,
): Promise<HistoryState[]> {
  const startTime = new Date(
    Date.now() - hoursAgo * 60 * 60 * 1000,
  ).toISOString()

  if (report) {
    report.startTime = startTime
    report.hoursAgo = hoursAgo
  }

  try {
    const response = await hass.callWS<Record<string, HistoryState[]>>({
      type: 'history/history_during_period',
      start_time: startTime,
      entity_ids: [entityId],
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    })

    if (report) {
      report.responseKeys = Object.keys(response ?? {})
    }

    if (!(entityId in response)) {
      if (report) {
        report.rawCount = 0
        report.uniqueRawStates = []
      }
      return []
    }

    const rawData = response[entityId]
    const history = Array.isArray(rawData) ? rawData : []

    if (report) {
      report.rawCount = history.length
      report.uniqueRawStates = uniqueRawStates(history)
      report.firstEntry = history[0]
      report.lastEntry = history[history.length - 1]
    }

    return history
  } catch (error) {
    console.error('Failed to fetch sleep history from HA WebSocket API:', error)
    if (report) {
      report.rawCount = 0
      report.uniqueRawStates = []
    }
    return []
  }
}

export function processSleepHistory(
  rawHistory: HistoryState[],
  stateMapping: HypnogramCardStateMapping,
  report?: HistoryProcessReport,
): ProcessedSleepHistory {
  const empty: ProcessedSleepHistory = {
    points: [],
    periodStart: new Date(),
    periodEnd: new Date(),
  }

  const warnings: string[] = []

  if (report) {
    report.stateMapping = stateMapping
    report.warnings = warnings
  }

  if (rawHistory.length === 0) {
    warnings.push('no raw history to process')
    if (report) {
      report.normalizedCount = 0
      report.droppedCount = 0
      report.uniqueStates = []
      report.sleepWindow = { startIndex: 0, stopIndex: 0 }
      report.phasePoints = 0
    }
    return empty
  }

  const reverseMapping = reverseStateMapping(stateMapping)
  if (report) {
    report.reverseMapping = reverseMapping
  }

  const dropped = rawHistory.filter(
    (entry) => normalizeHistoryState(entry, reverseMapping) === null,
  )

  const sortedPoints = rawHistory
    .map((entry) => normalizeHistoryState(entry, reverseMapping))
    .filter(
      (point): point is { state: string; timestamp: Date } => point !== null,
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  if (report) {
    report.normalizedCount = sortedPoints.length
    report.droppedCount = dropped.length
    report.uniqueStates = [...new Set(sortedPoints.map((point) => point.state))]
  }

  if (sortedPoints.length === 0) {
    warnings.push('no entries survived normalization')
    if (report) {
      report.sleepWindow = { startIndex: 0, stopIndex: 0 }
      report.phasePoints = 0
    }
    return empty
  }

  const { startIndex, stopIndex } = findSleepWindow(sortedPoints)
  if (report) {
    report.sleepWindow = { startIndex, stopIndex }
  }

  let sleepPeriod = sortedPoints.slice(startIndex, stopIndex + 1)

  let points: SleepDataPoint[] = sleepPeriod
    .filter((point) => isPhaseState(point.state))
    .map((point) => ({
      state: point.state,
      level: PHASE_LEVELS[point.state],
      timestamp: point.timestamp,
    }))

  if (points.length === 0) {
    warnings.push('no phase points in sleep window, fell back to full history')
    points = sortedPoints
      .filter((point) => isPhaseState(point.state))
      .map((point) => ({
        state: point.state,
        level: PHASE_LEVELS[point.state],
        timestamp: point.timestamp,
      }))
    sleepPeriod = sortedPoints
  }

  if (points.length === 0) {
    warnings.push('no phase points matched PHASE_LEVELS')
    if (report) {
      report.phasePoints = 0
    }
    return empty
  }

  const periodStart = points[0].timestamp
  const periodEnd =
    sleepPeriod[sleepPeriod.length - 1]?.timestamp ??
    points[points.length - 1].timestamp

  if (report) {
    report.phasePoints = points.length
    report.periodStart = periodStart.toISOString()
    report.periodEnd = periodEnd.toISOString()
  }

  return { points, periodStart, periodEnd }
}

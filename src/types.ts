import type { LovelaceCardConfig } from 'custom-card-helpers'

export interface HypnogramCardConfig extends LovelaceCardConfig {
  type: string
  entity: string
  title?: string
  debug?: boolean
  state_mapping?: HypnogramCardStateMapping
}

export interface HaFormSchemaField {
  name: string
  required?: boolean
  selector: Record<string, unknown>
}

export type SleepPhase = 'awake' | 'rem' | 'light_sleep' | 'deep_sleep'

export interface HypnogramCardStateMapping {
  deep_sleep: string
  light_sleep: string
  rem: string
  awake: string
}

export interface SleepIntegrationPreset {
  phases: readonly SleepPhase[]
  phaseLevels: Record<SleepPhase, number>
  stateMapping: HypnogramCardStateMapping
  tracking: {
    started: string
    stopped: string
  }
}

export interface HistoryState {
  s?: string
  state?: string
  lu?: number
  lc?: number
  last_changed?: string
}

export interface SleepDataPoint {
  state: string
  level: number
  timestamp: Date
}

export interface SleepSegment {
  state: string
  level: number
  startMs: number
  endMs: number
}

export interface ProcessedSleepHistory {
  points: SleepDataPoint[]
  periodStart: Date
  periodEnd: Date
}

export interface HistoryFetchReport {
  startTime: string
  hoursAgo: number
  responseKeys: string[]
  rawCount: number
  uniqueRawStates: string[]
  firstEntry?: HistoryState
  lastEntry?: HistoryState
}

export interface HistoryProcessReport {
  stateMapping: HypnogramCardStateMapping
  reverseMapping: Record<string, string>
  normalizedCount: number
  droppedCount: number
  uniqueStates: string[]
  sleepWindow: { startIndex: number; stopIndex: number }
  phasePoints: number
  periodStart?: string
  periodEnd?: string
  warnings: string[]
}

export interface ChartPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartDimensions {
  width: number
  height: number
  padding: ChartPadding
  plotWidth: number
  plotHeight: number
  levelHeight: number
  barHeight: number
}

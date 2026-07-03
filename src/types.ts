import type { LovelaceCardConfig } from 'custom-card-helpers'

export interface HypnogramCardConfig extends LovelaceCardConfig {
  type: string
  entity: string
  title?: string
  state_mapping?: Record<string, string>
}

export interface HypnogramCardStateMapping {
  deep_sleep: string
  light_sleep: string
  rem: string
  awake: string
}

export interface HistoryState {
  s: string
  t: number
}

export interface SleepDataPoint {
  state: string
  level: number
  timestamp: Date
}

export interface SleepSegment {
  state: string
  level: number
  startTime: Date
  endTime: Date
}

export interface ProcessedSleepHistory {
  points: SleepDataPoint[]
  periodStart: Date
  periodEnd: Date
}

export type SleepPhase = 'awake' | 'rem' | 'light_sleep' | 'deep_sleep'

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

import type { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers'

export type LegendPosition = 'left' | 'right'

export interface HypnogramCardConfig extends LovelaceCardConfig {
  type: string
  entity: string
  title?: string
  show_title?: boolean
  show_period_range?: boolean
  show_labels?: boolean
  show_legend_percentages?: boolean
  legend_position?: LegendPosition
  primary_color?: string
  bucket_minutes?: number
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
  state_mapping?: HypnogramCardStateMapping
}

export interface HaFormSchemaField {
  name?: string
  type?: 'grid' | 'expandable' | 'constant' | 'divider' | 'section'
  title?: string
  icon?: string
  required?: boolean
  default?: unknown
  flatten?: boolean
  disabled?: boolean
  selector?: Record<string, unknown>
  schema?: HaFormSchemaField[]
}

export type SleepPhase = 'awake' | 'rem' | 'light_sleep' | 'deep_sleep'

export interface HypnogramCardStateMapping {
  deep_sleep: string
  light_sleep: string
  rem: string
  awake: string
}

export interface SleepIntegrationPreset {
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

export interface ChartPalette {
  phaseColors: Record<SleepPhase, string>
}

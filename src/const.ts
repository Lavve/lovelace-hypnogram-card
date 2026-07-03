import type { SleepPhase } from '@/types'

export const CARD_VERSION = '0.0.1'

export const DEFAULT_STATE_MAPPING = {
  deep_sleep: 'deep',
  light_sleep: 'light',
  rem: 'rem',
  awake: 'awake',
}

export const PHASE_LEVELS: Record<string, number> = {
  awake: 4,
  rem: 3,
  light_sleep: 2,
  deep_sleep: 1,
}

export const SLEEP_PHASES: SleepPhase[] = [
  'awake',
  'rem',
  'light_sleep',
  'deep_sleep',
]

export const CHART_BAR_COLOR = '#4a7eb8'

export const CHART_CONFIG = {
  height: 150,
  padding: { top: 8, right: 8, bottom: 28, left: 72 },
  barHeightRatio: 0.6,
}

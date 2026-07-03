import type {
  HypnogramCardStateMapping,
  SleepIntegrationPreset,
  SleepPhase,
} from '@/types'

export const CARD_NAME = 'HYPNOGRAM-CARD'
export const CARD_VERSION = '0.0.1'

export const SLEEP_AS_ANDROID = {
  phases: ['awake', 'rem', 'light_sleep', 'deep_sleep'],
  phaseLevels: {
    awake: 4,
    rem: 3,
    light_sleep: 2,
    deep_sleep: 1,
  },
  stateMapping: {
    deep_sleep: 'deep_sleep',
    light_sleep: 'light_sleep',
    rem: 'rem',
    awake: 'awake',
  },
  tracking: {
    started: 'sleep_tracking_started',
    stopped: 'sleep_tracking_stopped',
  },
} as const satisfies SleepIntegrationPreset

export const SLEEP_PHASES: SleepPhase[] = [...SLEEP_AS_ANDROID.phases]

export const PHASE_LEVELS: Record<string, number> = {
  ...SLEEP_AS_ANDROID.phaseLevels,
}

export const DEFAULT_STATE_MAPPING: HypnogramCardStateMapping = {
  ...SLEEP_AS_ANDROID.stateMapping,
}

export const CHART_BAR_COLOR = '#4a7eb8'

export const CHART_CONFIG = {
  height: 150,
  padding: { top: 8, right: 8, bottom: 28, left: 72 },
  barHeightRatio: 0.6,
}

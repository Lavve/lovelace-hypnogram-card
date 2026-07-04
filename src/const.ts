import type { HypnogramCardStateMapping, SleepIntegrationPreset } from '@/types'

export const CARD_NAME = 'HYPNOGRAM-CARD'
export const CARD_VERSION = '0.0.1'

export const SLEEP_AS_ANDROID = {
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

export const PHASE_LEVELS: Record<string, number> = {
  ...SLEEP_AS_ANDROID.phaseLevels,
}

export const DEFAULT_STATE_MAPPING: HypnogramCardStateMapping = {
  ...SLEEP_AS_ANDROID.stateMapping,
}

export const CHART_CONFIG = {
  height: 168,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  bucketMinutes: 30,
  bucketMinutesMin: 1,
  bucketMinutesMax: 30,
} as const

export function clampBucketMinutes(value?: number): number {
  const minutes = value ?? CHART_CONFIG.bucketMinutes
  return Math.min(
    CHART_CONFIG.bucketMinutesMax,
    Math.max(CHART_CONFIG.bucketMinutesMin, minutes),
  )
}

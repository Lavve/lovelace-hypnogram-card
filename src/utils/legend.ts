import type { HomeAssistant } from 'custom-card-helpers'
import type { LegendFormat, SleepPhase } from '@/types'
import { formatDurationShort } from '@/utils/time'

export function formatLegendValue(
  phase: SleepPhase,
  legendFormat: LegendFormat,
  phaseDurations: Record<SleepPhase, number>,
  phasePercentages: Record<SleepPhase, number>,
  hass?: HomeAssistant,
): string {
  if (legendFormat === 'percent') {
    return `${phasePercentages[phase]}%`
  }

  const duration = formatDurationShort(phaseDurations[phase], hass)
  if (legendFormat === 'duration') {
    return duration
  }

  return `${duration} (${phasePercentages[phase]}%)`
}

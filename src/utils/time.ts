import {
  type FrontendLocaleData,
  formatTime as formatHaTime,
} from 'custom-card-helpers'

export function formatPeriodRange(
  startMs: number | undefined,
  endMs: number | undefined,
  locale?: FrontendLocaleData,
): string {
  if (
    startMs === undefined ||
    endMs === undefined ||
    endMs <= startMs ||
    !locale
  ) {
    return ''
  }

  return `${formatHaTime(new Date(startMs), locale)} — ${formatHaTime(new Date(endMs), locale)}`
}

export function formatTotalDuration(
  startMs: number | undefined,
  endMs: number | undefined,
): string {
  if (startMs === undefined || endMs === undefined || endMs <= startMs) {
    return ''
  }

  const totalMinutes = Math.floor((endMs - startMs) / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

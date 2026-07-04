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

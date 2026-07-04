import {
  type FrontendLocaleData,
  formatTime as formatHaTime,
} from 'custom-card-helpers'

export function formatPeriodRange(
  startMs: number,
  endMs: number,
  locale?: FrontendLocaleData,
): string {
  if (!startMs || !endMs || endMs <= startMs || !locale) return ''

  return `${formatHaTime(new Date(startMs), locale)} — ${formatHaTime(new Date(endMs), locale)}`
}

export function getTimeTicks(
  startMs: number,
  endMs: number,
  count = 4,
): number[] {
  const duration = endMs - startMs

  if (duration <= 0) return [startMs]

  const ticks: number[] = []
  for (let i = 0; i < count; i++) {
    ticks.push(startMs + (duration * i) / (count - 1))
  }
  return ticks
}

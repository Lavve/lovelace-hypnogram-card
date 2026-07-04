export function formatTime(date: Date, locale?: string): string {
  return date.toLocaleTimeString(locale || undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatPeriodRange(
  startMs: number,
  endMs: number,
  locale?: string,
): string {
  if (!startMs || !endMs || endMs <= startMs) return ''

  return `${formatTime(new Date(startMs), locale)} — ${formatTime(new Date(endMs), locale)}`
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

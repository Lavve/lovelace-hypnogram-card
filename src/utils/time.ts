export function formatTime(date: Date, locale?: string): string {
  return date.toLocaleTimeString(locale || undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function getTimeTicks(start: Date, end: Date, count = 4): Date[] {
  const startMs = start.getTime()
  const endMs = end.getTime()
  const duration = endMs - startMs

  if (duration <= 0) return [start]

  const ticks: Date[] = []
  for (let i = 0; i < count; i++) {
    ticks.push(new Date(startMs + (duration * i) / (count - 1)))
  }
  return ticks
}

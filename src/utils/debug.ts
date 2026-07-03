import type { HistoryFetchReport, HistoryProcessReport } from '@/types'

const PREFIX = 'hypnogram-card'

export function logCardBanner(name: string, version: string): void {
  console.info(
    `%c ${name} %c ${version} `,
    'color: lime; background: darkgreen; font-weight: bold; border-radius: 4px 0 0 4px; padding: 4px 6px;',
    'color: darkgreen; background: lime; font-weight: bold; border-radius: 0 4px 4px 0; padding: 4px 6px;',
  )
}

export function logHistoryReport(
  entityId: string,
  currentState: string | undefined,
  segments: number,
  fetch: HistoryFetchReport,
  process: HistoryProcessReport,
): void {
  const label = `[${PREFIX}] ${entityId} → ${segments} segment${segments === 1 ? '' : 's'}`
  console.groupCollapsed(label)
  console.log('current state:', currentState)
  console.log('fetch:', fetch)
  console.log('process:', process)
  console.groupEnd()
}

export function uniqueRawStates(
  history: { s?: string; state?: string }[],
): string[] {
  return [
    ...new Set(history.map((entry) => entry.s ?? entry.state ?? '<missing>')),
  ]
}

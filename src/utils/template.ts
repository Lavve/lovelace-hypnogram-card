import type { HomeAssistant } from 'custom-card-helpers'

export function isJinjaTemplate(value: string | undefined): boolean {
  return (
    typeof value === 'string' && (value.includes('{{') || value.includes('{%'))
  )
}

export function templateResultToString(result: unknown): string | undefined {
  if (result === undefined || result === null) return undefined
  if (typeof result === 'string') {
    const trimmed = result.trim()
    return trimmed || undefined
  }
  if (typeof result === 'number' || typeof result === 'boolean') {
    return String(result)
  }
  return undefined
}

interface RenderTemplateMessage {
  result?: string
  error?: string
}

export async function subscribeRenderTemplate(
  hass: HomeAssistant,
  template: string,
  onResult: (value: string | undefined) => void,
  variables?: Record<string, unknown>,
): Promise<() => void> {
  return hass.connection.subscribeMessage(
    (message: RenderTemplateMessage) => {
      if (message.error) {
        console.warn('hypnogram-card template error:', message.error)
        onResult(undefined)
        return
      }
      onResult(templateResultToString(message.result))
    },
    {
      type: 'render_template',
      template,
      variables,
      report_errors: true,
      timeout: 3,
    },
  )
}

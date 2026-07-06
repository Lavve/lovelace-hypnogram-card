import type { HomeAssistant } from 'custom-card-helpers'
import { html, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { CHART_CONFIG } from '@/const'
import { localize } from '@/locales/localize'
import { buildChartPalette } from '@/styles'
import type { ChartPalette, LegendPosition, SleepSegment } from '@/types'
import {
  buildCompressedLayout,
  getAdjacentBarSegments,
  getBarStepRadii,
  getChartDimensions,
  getLayoutSegmentRect,
} from '@/utils/chart'

function getPhaseColor(palette: ChartPalette, state: string): string {
  return (
    palette.phaseColors[state as keyof ChartPalette['phaseColors']] ??
    palette.phaseColors.light_sleep
  )
}

export function renderHypnogramChart(
  segments: SleepSegment[],
  hass?: HomeAssistant,
  primaryColor?: string,
  showLegends?: boolean,
  legendPosition: LegendPosition = 'left',
  context?: HTMLElement,
): TemplateResult {
  const palette = buildChartPalette(primaryColor, context)
  const dims = getChartDimensions(400, CHART_CONFIG.height)
  const layout = buildCompressedLayout(segments)
  const hasData = layout.layoutEndMs > 0 && layout.bars.length > 0

  const bars = layout.bars.map((segment, index) => {
    const { prev, next } = getAdjacentBarSegments(layout.bars, index)
    const stepRadii = getBarStepRadii(segment, prev, next)
    const rect = getLayoutSegmentRect(
      segment,
      layout.layoutStartMs,
      layout.layoutEndMs,
      dims,
    )
    const barStyle = {
      position: 'absolute',
      left: `${(rect.x / dims.width) * 100}%`,
      top: `${(rect.y / dims.height) * 100}%`,
      width: `${Math.max((rect.width / dims.width) * 100, 0.2)}%`,
      height: `${(rect.height / dims.height) * 100}%`,
      backgroundColor: getPhaseColor(palette, segment.state),
      ...stepRadii,
    } as const

    return html`<div class="bar" style=${styleMap(barStyle)}></div>`
  })

  const labels = [
    { key: 'deep_sleep', label: localize('card.label.deep_sleep', hass) },
    { key: 'rem', label: localize('card.label.rem', hass) },
    { key: 'awake', label: localize('card.label.awake', hass) },
    { key: 'light_sleep', label: localize('card.label.light_sleep', hass) },
  ]

  return html`
    <div
      class="chart-container${showLegends ? ` legend-${legendPosition}` : ''}"
      style=${styleMap({
        position: 'relative',
        width: '100%',
        height: `${dims.height}px`,
        minHeight: `${dims.height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
      })}
    >
      ${
        showLegends
          ? html`
          <div class="legends">
            ${labels.map(
              (label) => html`
            <div class="legend ${label.key}">${label.label}</div>`,
            )}
          </div>`
          : ''
      }

      <div class="plot">
        ${bars}
      </div>
      ${
        hasData
          ? ''
          : html`
            <div class="empty-overlay">
              ${localize('card.no_data', hass)}
            </div>
          `
      }
    </div>
  `
}

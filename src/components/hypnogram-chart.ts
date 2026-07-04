import type { HomeAssistant } from 'custom-card-helpers'
import { html, type TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { CHART_CONFIG } from '@/const'
import { localize } from '@/localize'
import { buildChartPalette } from '@/styles'
import type { ChartPalette, SleepSegment } from '@/types'
import {
  buildCompressedLayout,
  getAdjacentBarSegments,
  getAwakeLineAtX,
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
  _periodStartMs: number,
  _periodEndMs: number,
  hass?: HomeAssistant,
  primaryColor?: string,
  context?: HTMLElement,
): TemplateResult {
  const palette = buildChartPalette(primaryColor, context)
  const dims = getChartDimensions(400, CHART_CONFIG.height)
  const layout = buildCompressedLayout(segments)
  const hasData =
    layout.layoutEndMs > 0 &&
    (layout.bars.length > 0 || layout.awakeLineMs.length > 0)

  const sleepBars = layout.bars.map((segment, index) => {
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

  const awakeLines = layout.awakeLineMs.map((layoutMs) => {
    const rect = getAwakeLineAtX(
      layoutMs,
      layout.layoutStartMs,
      layout.layoutEndMs,
      dims,
    )
    const lineStyle = {
      position: 'absolute',
      left: `${(rect.x / dims.width) * 100}%`,
      top: `${(rect.y / dims.height) * 100}%`,
      width: '2px',
      height: `${(rect.height / dims.height) * 100}%`,
      backgroundColor: palette.phaseColors.awake,
    } as const

    return html`<div class="awake-line" style=${styleMap(lineStyle)}></div>`
  })

  return html`
    <div
      class="chart-container"
      style=${styleMap({
        position: 'relative',
        width: '100%',
        height: `${dims.height}px`,
        minHeight: `${dims.height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
      })}
    >
      <div
        class="plot"
        style=${styleMap({
          position: 'absolute',
          inset: '0',
        })}
      >
        ${sleepBars}
        ${awakeLines}
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

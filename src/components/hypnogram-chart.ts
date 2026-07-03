import type { HomeAssistant } from 'custom-card-helpers'
import { html, type TemplateResult } from 'lit'
import {
  CHART_BAR_COLOR,
  CHART_CONFIG,
  PHASE_LEVELS,
  SLEEP_PHASES,
} from '@/const'
import { localize } from '@/localize'
import type { SleepSegment } from '@/types'
import {
  getChartDimensions,
  getSegmentRect,
  levelToY,
  timeToX,
} from '@/utils/chart'
import { formatTime, getTimeTicks } from '@/utils/time'

export function renderHypnogramChart(
  segments: SleepSegment[],
  periodStartMs: number,
  periodEndMs: number,
  hass?: HomeAssistant,
): TemplateResult {
  const width = 400
  const dims = getChartDimensions(width, CHART_CONFIG.height)
  const locale = hass?.locale?.language
  const hasData = segments.length > 0 && periodEndMs > periodStartMs

  const chartStartMs = hasData ? periodStartMs : Date.now() - 8 * 60 * 60 * 1000
  const chartEndMs = hasData ? periodEndMs : Date.now()

  const bars = hasData
    ? segments.map((segment) => {
        const rect = getSegmentRect(segment, periodStartMs, periodEndMs, dims)
        return html`
          <rect
            x=${rect.x}
            y=${rect.y}
            width=${rect.width}
            height=${rect.height}
            rx="2"
            fill=${CHART_BAR_COLOR}
          />
        `
      })
    : []

  const phaseLabels = SLEEP_PHASES.map((phase) => {
    const level = PHASE_LEVELS[phase]
    const y = levelToY(level, dims) + dims.levelHeight / 2

    return html`
      <text
        x=${dims.padding.left - 8}
        y=${y}
        text-anchor="end"
        dominant-baseline="middle"
        class="phase-label"
      >
        ${localize(`card.phase.${phase}`, hass)}
      </text>
    `
  })

  const timeTicks = getTimeTicks(chartStartMs, chartEndMs)
  const timeLabels = timeTicks.map((tickMs) => {
    const x = timeToX(tickMs, chartStartMs, chartEndMs, dims)
    return html`
      <text
        x=${x}
        y=${dims.height - 6}
        text-anchor="middle"
        class="time-label"
      >
        ${formatTime(new Date(tickMs), locale)}
      </text>
    `
  })

  const gridLines = SLEEP_PHASES.map((phase) => {
    const level = PHASE_LEVELS[phase]
    const y = levelToY(level, dims) + dims.levelHeight

    return html`
      <line
        x1=${dims.padding.left}
        y1=${y}
        x2=${dims.padding.left + dims.plotWidth}
        y2=${y}
        class="grid-line"
      />
    `
  })

  return html`
    <div class="chart-container">
      <svg
        width=${dims.width}
        height=${dims.height}
        viewBox="0 0 ${dims.width} ${dims.height}"
        class="chart"
        role="img"
        aria-label=${localize('card.title', hass)}
      >
        ${gridLines}
        ${bars}
        ${phaseLabels}
        ${timeLabels}
      </svg>
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

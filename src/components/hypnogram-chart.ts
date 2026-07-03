import type { HomeAssistant } from 'custom-card-helpers'
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
  CHART_BAR_COLOR,
  CHART_CONFIG,
  PHASE_LEVELS,
  SLEEP_PHASES,
} from '@/const'
import { localize } from '@/localize'
import { chartStyles } from '@/styles'
import type { SleepSegment } from '@/types'
import {
  getChartDimensions,
  getSegmentRect,
  levelToY,
  timeToX,
} from '@/utils/chart'
import { formatTime, getTimeTicks } from '@/utils/time'

@customElement('hypnogram-chart')
export class HypnogramChart extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant
  @property({ type: Array }) public segments: SleepSegment[] = []
  @property({ attribute: false }) public periodStart!: Date
  @property({ attribute: false }) public periodEnd!: Date

  protected render(): TemplateResult {
    const width = 400
    const dims = getChartDimensions(width, CHART_CONFIG.height)
    const locale = this.hass?.locale?.language
    const hasData = this.segments.length > 0

    const periodStart = hasData
      ? this.periodStart
      : new Date(Date.now() - 8 * 60 * 60 * 1000)
    const periodEnd = hasData ? this.periodEnd : new Date()

    const bars = hasData
      ? this.segments.map((segment) => {
          const rect = getSegmentRect(
            segment,
            this.periodStart,
            this.periodEnd,
            dims,
          )
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
          ${localize(`card.phase.${phase}`, this.hass)}
        </text>
      `
    })

    const timeTicks = getTimeTicks(periodStart, periodEnd)
    const timeLabels = timeTicks.map((tick) => {
      const x = timeToX(tick, periodStart, periodEnd, dims)
      return html`
        <text
          x=${x}
          y=${dims.height - 6}
          text-anchor="middle"
          class="time-label"
        >
          ${formatTime(tick, locale)}
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
          viewBox="0 0 ${dims.width} ${dims.height}"
          preserveAspectRatio="xMidYMid meet"
          class="chart"
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
                ${localize('card.no_data', this.hass)}
              </div>
            `
        }
      </div>
    `
  }

  static styles = chartStyles
}

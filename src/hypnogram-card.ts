import type { HomeAssistant } from 'custom-card-helpers'
import {
  type ActionHandlerEvent,
  handleAction,
  hasAction,
  hasDoubleClick,
} from 'custom-card-helpers'
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { actionHandler } from '@/action-handler-directive'
import { renderHypnogramChart } from '@/components/hypnogram-chart'
import {
  CARD_NAME,
  CARD_VERSION,
  CHART_CONFIG,
  DEFAULT_STATE_MAPPING,
} from '@/const'
import '@/hypnogram-card-editor'
import { localize } from '@/localize'
import { fetchSleepHistory, processSleepHistory } from '@/services/history'
import { cardStyles, chartStyles } from '@/styles'
import type { HypnogramCardConfig, SleepSegment } from '@/types'
import { DEFAULT_PRIMARY_COLOR } from '@/utils/colors'
import { logCardBanner } from '@/utils/debug'
import { bucketSleepSegments, buildSleepSegments } from '@/utils/segments'
import { formatPeriodRange } from '@/utils/time'

declare global {
  interface Window {
    customCards?: Array<{
      type: string
      name: string
      description?: string
      preview?: boolean
    }>
  }
}

@customElement('hypnogram-card')
export class HypnogramCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private config!: HypnogramCardConfig
  @state() private _segments: SleepSegment[] = []
  @state() private _rawSegments: SleepSegment[] = []
  @state() private _periodStartMs = 0
  @state() private _periodEndMs = 0
  @state() private _loading = false
  private _lastEntityId?: string
  private _lastState?: string
  private _lastBucketMinutes?: number
  private _fetchGeneration = 0

  public static getConfigElement(): HTMLElement {
    return document.createElement('hypnogram-card-editor')
  }

  public static getStubConfig(): Record<string, unknown> {
    return {
      type: 'custom:hypnogram-card',
      title: '',
      entity: '',
      grid_options: {
        rows: 4,
        columns: 12,
      },
    }
  }

  public setConfig(config: HypnogramCardConfig): void {
    if (!config.entity) {
      throw new Error('You must define an entity')
    }
    this.config = {
      ...config,
      state_mapping: config.state_mapping || DEFAULT_STATE_MAPPING,
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties)

    if (!this.hass || !this.config?.entity) return

    const entityId = this.config.entity
    const currentState = this.hass.states[entityId]?.state

    const entityChanged = this._lastEntityId !== entityId
    const stateChanged = this._lastState !== currentState
    const bucketMinutes = this._getBucketMinutes()
    const bucketChanged = this._lastBucketMinutes !== bucketMinutes
    const needsInitialFetch = this._lastEntityId === undefined

    if (bucketChanged && this._rawSegments.length > 0) {
      this._lastBucketMinutes = bucketMinutes
      this._applyBucketedSegments()
    }

    if (entityChanged || stateChanged || needsInitialFetch) {
      this._lastEntityId = entityId
      this._lastState = currentState
      this._lastBucketMinutes = bucketMinutes
      void this._updateHistory(entityId)
    }
  }

  private _getBucketMinutes(): number {
    return this.config.bucket_minutes ?? CHART_CONFIG.bucketMinutes
  }

  private _applyBucketedSegments(): void {
    this._segments = bucketSleepSegments(
      this._rawSegments,
      this._periodStartMs,
      this._periodEndMs,
      this._getBucketMinutes(),
    )
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    handleAction(this, this.hass, this.config, ev.detail.action)
  }

  private async _updateHistory(entityId: string): Promise<void> {
    const generation = ++this._fetchGeneration
    this._loading = true

    try {
      const historyData = await fetchSleepHistory(this.hass, entityId)
      if (generation !== this._fetchGeneration) return

      const history = processSleepHistory(
        historyData,
        this.config.state_mapping ?? DEFAULT_STATE_MAPPING,
      )

      this._periodStartMs = history.periodStart.getTime()
      this._periodEndMs = history.periodEnd.getTime()
      this._rawSegments = buildSleepSegments(history)
      this._applyBucketedSegments()
    } catch (e) {
      console.error('Error fetching sleep history:', e)
    } finally {
      if (generation === this._fetchGeneration) {
        this._loading = false
      }
    }
  }

  public getCardSize(): number {
    return 4
  }

  public getGridOptions() {
    return {
      rows: 4,
      columns: 12,
      min_rows: 4,
    }
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.config) {
      return html``
    }

    const entityId = this.config.entity
    const stateObj = this.hass.states[entityId]

    if (!stateObj) {
      return html`
        <div class="card error">
          ${localize('card.error_entity_not_found', this.hass)}: ${entityId}
        </div>
      `
    }

    const showTitle = this.config.show_title !== false
    const showPeriod = this.config.show_period_range !== false
    const title = this.config.title || localize('card.title', this.hass)
    const periodRange = formatPeriodRange(
      this._periodStartMs,
      this._periodEndMs,
      this.hass.locale,
    )

    const interactive =
      hasAction(this.config.tap_action) ||
      hasAction(this.config.hold_action) ||
      hasDoubleClick(this.config.double_tap_action)

    return html`
      <div
        class="card${interactive ? ' interactive' : ''}"
        @action=${this._handleAction}
        ${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasDoubleClick(this.config.double_tap_action),
        })}
        tabindex=${interactive ? '0' : '-1'}
      >
        ${
          showTitle || showPeriod
            ? html`
              <div class="header-row">
                <div class="header${showTitle ? '' : ' is-hidden'}">${title}</div>
                <div class="period-range${showPeriod ? '' : ' is-hidden'}">
                  ${periodRange}
                </div>
              </div>
            `
            : ''
        }
        <div class="chart-area">
          ${renderHypnogramChart(
            this._segments,
            this._periodStartMs,
            this._periodEndMs,
            this.hass,
            this.config.primary_color ?? DEFAULT_PRIMARY_COLOR,
            this.config.show_labels ?? false,
            this.config.legend_position ?? 'left',
            this,
          )}
          ${
            this._loading
              ? html`
                <div class="loading-overlay">
                  ${localize('card.loading', this.hass)}
                </div>
              `
              : ''
          }
        </div>
      </div>
    `
  }

  static styles = [cardStyles, chartStyles]
}

logCardBanner(CARD_NAME, CARD_VERSION)

window.customCards = window.customCards ?? []
window.customCards.push({
  type: 'hypnogram-card',
  name: CARD_NAME,
  description: 'Sleep hypnogram chart for Home Assistant',
  preview: true,
})

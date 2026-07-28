import type { HomeAssistant } from 'custom-card-helpers'
import {
  type ActionHandlerEvent,
  deepEqual,
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
  CARD_TYPE,
  CARD_TYPE_EDITOR,
  CARD_VERSION,
  clampBucketMinutes,
  DEFAULT_STATE_MAPPING,
  DEFAULT_TRACKING_MAPPING,
} from '@/const'
import '@/hypnogram-card-editor'
import { localize } from '@/locales/localize'
import { fetchSleepHistory, processSleepHistory } from '@/services/history'
import { cardStyles, chartStyles } from '@/styles'
import type { HypnogramCardConfig, SleepSegment } from '@/types'
import { DEFAULT_PRIMARY_COLOR } from '@/utils/colors'
import { resolveLegendFormat } from '@/utils/config'
import { logCardBanner } from '@/utils/debug'
import {
  bucketSleepSegments,
  buildSleepSegments,
  calculateSleepEfficiency,
  estimateSleepCycles,
} from '@/utils/segments'
import { isJinjaTemplate, subscribeRenderTemplate } from '@/utils/template'
import { formatPeriodRange, formatTotalDuration } from '@/utils/time'

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

@customElement(CARD_TYPE)
export class HypnogramCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private config!: HypnogramCardConfig
  @state() private _segments: SleepSegment[] = []
  @state() private _rawSegments: SleepSegment[] = []
  @state() private _periodStartMs?: number
  @state() private _periodEndMs?: number
  @state() private _loading = false
  @state() private _resolvedPrimaryColor?: string
  private _lastEntityId?: string
  private _lastState?: string
  private _lastBucketMinutes?: number
  private _fetchGeneration = 0
  private _primaryColorTemplate?: string
  private _subscribedPrimaryColorConfig?: HypnogramCardConfig
  private _unsubPrimaryColor?: Promise<() => void>

  public static getConfigElement(): HTMLElement {
    return document.createElement(CARD_TYPE_EDITOR)
  }

  public static getStubConfig(): Record<string, unknown> {
    return {
      type: `custom:${CARD_TYPE}`,
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
    const next: HypnogramCardConfig = {
      ...config,
      state_mapping: config.state_mapping || DEFAULT_STATE_MAPPING,
      tracking_mapping: {
        ...DEFAULT_TRACKING_MAPPING,
        ...config.tracking_mapping,
      },
    }
    if (this.config && deepEqual(this.config, next)) {
      return
    }
    this.config = next
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    void this._unsubscribePrimaryColorTemplate()
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties)

    if (!this.hass || !this.config?.entity) return

    if (changedProperties.has('hass') || changedProperties.has('config')) {
      void this._syncPrimaryColorTemplate()
    }

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
    return clampBucketMinutes(this.config.bucket_minutes)
  }

  private _applyBucketedSegments(): void {
    if (this._periodStartMs === undefined || this._periodEndMs === undefined) {
      this._segments = []
      return
    }

    this._segments = bucketSleepSegments(
      this._rawSegments,
      this._periodStartMs,
      this._periodEndMs,
      this._getBucketMinutes(),
    )
  }

  private _getPrimaryColor(): string {
    const configured = this.config.primary_color ?? DEFAULT_PRIMARY_COLOR
    if (isJinjaTemplate(configured)) {
      return this._resolvedPrimaryColor ?? DEFAULT_PRIMARY_COLOR
    }
    return configured
  }

  private async _unsubscribePrimaryColorTemplate(): Promise<void> {
    if (!this._unsubPrimaryColor) return

    try {
      const unsub = await this._unsubPrimaryColor
      unsub()
    } catch {
      // Connection may already be closed.
    }

    this._unsubPrimaryColor = undefined
    this._primaryColorTemplate = undefined
    this._subscribedPrimaryColorConfig = undefined
  }

  private async _syncPrimaryColorTemplate(): Promise<void> {
    if (!this.hass || !this.config) return

    const configured = this.config.primary_color ?? DEFAULT_PRIMARY_COLOR

    if (!isJinjaTemplate(configured)) {
      this._resolvedPrimaryColor = undefined
      await this._unsubscribePrimaryColorTemplate()
      return
    }

    if (
      this._primaryColorTemplate === configured &&
      this._subscribedPrimaryColorConfig !== undefined &&
      deepEqual(this._subscribedPrimaryColorConfig, this.config) &&
      this._unsubPrimaryColor !== undefined
    ) {
      return
    }

    await this._unsubscribePrimaryColorTemplate()
    this._primaryColorTemplate = configured
    this._subscribedPrimaryColorConfig = this.config

    try {
      this._unsubPrimaryColor = subscribeRenderTemplate(
        this.hass,
        configured,
        (value) => {
          this._resolvedPrimaryColor = value
        },
        { config: this.config },
      )
    } catch (error) {
      console.error('hypnogram-card failed to subscribe to template:', error)
    }
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
        this.config.tracking_mapping ?? DEFAULT_TRACKING_MAPPING,
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
    const showTotalTime = showTitle && this.config.show_total_time !== false
    const showSleepEfficiency = this.config.show_sleep_efficiency === true
    const showSleepCycles = this.config.show_sleep_cycles === true
    const title = this.config.title || localize('card.title', this.hass)
    const periodRange = formatPeriodRange(
      this._periodStartMs,
      this._periodEndMs,
      this.hass.locale,
    )
    const totalTime = formatTotalDuration(
      this._periodStartMs,
      this._periodEndMs,
    )
    const sleepEfficiency = showSleepEfficiency
      ? calculateSleepEfficiency(this._rawSegments)
      : undefined
    const sleepCycles = showSleepCycles
      ? estimateSleepCycles(this._rawSegments)
      : undefined
    const legendFormat = resolveLegendFormat(this.config)

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
          showTitle ||
          showPeriod ||
          showTotalTime ||
          showSleepEfficiency ||
          showSleepCycles
            ? html`
              <div class="header-row${showTitle ? '' : ' header-row-meta-only'}">
                ${showTitle ? html`<div class="header">${title}</div>` : ''}
                <div class="header-meta">
                  ${
                    showTotalTime
                      ? html`<div class="total-time">${totalTime}</div>`
                      : ''
                  }
                  ${
                    showSleepCycles && sleepCycles !== undefined
                      ? html`
                        <div class="sleep-cycles">
                          ${localize('card.sleep_cycles', this.hass, {
                            count: sleepCycles,
                          })}
                        </div>
                      `
                      : ''
                  }
                  ${
                    showSleepEfficiency && sleepEfficiency !== undefined
                      ? html`
                        <div class="sleep-efficiency">
                          ${localize('card.sleep_efficiency', this.hass, {
                            value: sleepEfficiency,
                          })}
                        </div>
                      `
                      : ''
                  }
                  ${
                    showPeriod
                      ? html`<div class="period-range">${periodRange}</div>`
                      : ''
                  }
                </div>
              </div>
            `
            : ''
        }
        <div class="chart-area">
          ${renderHypnogramChart(
            this._segments,
            this.hass,
            this._getPrimaryColor(),
            this.config.show_labels ?? false,
            this.config.legend_position ?? 'left',
            this,
            legendFormat,
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
  type: CARD_TYPE,
  name: CARD_NAME,
  description: 'Sleep hypnogram chart for Home Assistant',
  preview: true,
})

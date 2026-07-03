import type { HomeAssistant } from 'custom-card-helpers'
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { renderHypnogramChart } from '@/components/hypnogram-chart'
import { CARD_NAME, CARD_VERSION, DEFAULT_STATE_MAPPING } from '@/const'
import '@/hypnogram-card-editor'
import { localize } from '@/localize'
import { fetchSleepHistory, processSleepHistory } from '@/services/history'
import { cardStyles, chartStyles } from '@/styles'
import type { HypnogramCardConfig, SleepSegment } from '@/types'
import { logCardBanner, logHistoryReport } from '@/utils/debug'
import { buildSleepSegments } from '@/utils/segments'

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
  @state() private _periodStartMs = 0
  @state() private _periodEndMs = 0
  @state() private _loading = false
  private _lastEntityId?: string
  private _lastState?: string
  private _fetchGeneration = 0

  public static getConfigElement(): HTMLElement {
    return document.createElement('hypnogram-card-editor')
  }

  public static getStubConfig(): Record<string, string> {
    return {
      title: '',
      entity: '',
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
    const needsInitialFetch = this._lastEntityId === undefined

    if (entityChanged || stateChanged || needsInitialFetch) {
      this._lastEntityId = entityId
      this._lastState = currentState
      void this._updateHistory(entityId)
    }
  }

  private async _updateHistory(entityId: string): Promise<void> {
    const generation = ++this._fetchGeneration
    const debug = this.config.debug ?? false
    this._loading = true

    const fetchReport = debug
      ? {
          startTime: '',
          hoursAgo: 0,
          responseKeys: [] as string[],
          rawCount: 0,
          uniqueRawStates: [] as string[],
        }
      : undefined

    const processReport = debug
      ? {
          stateMapping: this.config.state_mapping ?? DEFAULT_STATE_MAPPING,
          reverseMapping: {},
          normalizedCount: 0,
          droppedCount: 0,
          uniqueStates: [] as string[],
          sleepWindow: { startIndex: 0, stopIndex: 0 },
          phasePoints: 0,
          warnings: [] as string[],
        }
      : undefined

    try {
      const historyData = await fetchSleepHistory(
        this.hass,
        entityId,
        48,
        fetchReport,
      )
      if (generation !== this._fetchGeneration) return

      const history = processSleepHistory(
        historyData,
        this.config.state_mapping ?? DEFAULT_STATE_MAPPING,
        processReport,
      )

      this._periodStartMs = history.periodStart.getTime()
      this._periodEndMs = history.periodEnd.getTime()
      this._segments = buildSleepSegments(history)

      if (debug && fetchReport && processReport) {
        logHistoryReport(
          entityId,
          this.hass.states[entityId]?.state,
          this._segments.length,
          fetchReport,
          processReport,
        )
      }
    } catch (e) {
      console.error('Error fetching sleep history:', e)
    } finally {
      if (generation === this._fetchGeneration) {
        this._loading = false
      }
    }
  }

  public getCardSize(): number {
    return 3
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.config) {
      return html``
    }

    const entityId = this.config.entity
    const stateObj = this.hass.states[entityId]

    if (!stateObj) {
      return html`
        <ha-card class="error">
          <div class="card-content">
            ${localize('card.error_entity_not_found', this.hass)}: ${entityId}
          </div>
        </ha-card>
      `
    }

    const title = this.config.title || localize('card.title', this.hass)

    return html`
      <ha-card>
        <div class="card-content">
          <div class="header">${title}</div>
          <div class="chart-area">
            ${renderHypnogramChart(
              this._segments,
              this._periodStartMs,
              this._periodEndMs,
              this.hass,
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
      </ha-card>
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

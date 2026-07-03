import type { HomeAssistant } from 'custom-card-helpers'
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '@/components/hypnogram-chart'
import { DEFAULT_STATE_MAPPING } from '@/const'
import '@/hypnogram-card-editor'
import { localize } from '@/localize'
import { fetchSleepHistory, processSleepHistory } from '@/services/history'
import { cardStyles } from '@/styles'
import type { HypnogramCardConfig, ProcessedSleepHistory } from '@/types'
import { buildSleepSegments } from '@/utils/segments'

const EMPTY_HISTORY: ProcessedSleepHistory = {
  points: [],
  periodStart: new Date(),
  periodEnd: new Date(),
}

@customElement('hypnogram-card')
export class HypnogramCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private config!: HypnogramCardConfig
  @state() private _sleepHistory: ProcessedSleepHistory = EMPTY_HISTORY
  @state() private _loading = false
  private _lastEntityId?: string
  private _lastState?: string

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

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties)

    if (!this.hass || !this.config?.entity) return

    const entityId = this.config.entity
    const currentState = this.hass.states[entityId]?.state

    const entityChanged = this._lastEntityId !== entityId
    const stateChanged = this._lastState !== currentState

    if (entityChanged || stateChanged) {
      this._lastEntityId = entityId
      this._lastState = currentState
      this._updateHistory(entityId)
    }
  }

  private async _updateHistory(entityId: string): Promise<void> {
    this._loading = true
    try {
      const historyData = await fetchSleepHistory(this.hass, entityId)
      this._sleepHistory = processSleepHistory(historyData)
    } catch (e) {
      console.error('Error fetching sleep history:', e)
    } finally {
      this._loading = false
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
          ${localize('card.error_entity_not_found', this.hass)}: ${entityId}
        </ha-card>
      `
    }

    const segments = buildSleepSegments(this._sleepHistory)

    return html`
      <ha-card>
        <div class="header">
          ${this.config.title || localize('card.title', this.hass)}
        </div>
        <div class="content">
          ${
            this._loading
              ? html`<div class="loading">${localize('card.loading', this.hass)}</div>`
              : html`
                <hypnogram-chart
                  .hass=${this.hass}
                  .segments=${segments}
                  .periodStart=${this._sleepHistory.periodStart}
                  .periodEnd=${this._sleepHistory.periodEnd}
                ></hypnogram-chart>
              `
          }
        </div>
      </ha-card>
    `
  }

  static styles = cardStyles
}

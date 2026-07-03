import type { HomeAssistant } from 'custom-card-helpers'
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { DEFAULT_STATE_MAPPING } from './const'
import { cardStyles } from './styles'
import type { HypnogramCardConfig } from './types'
import './hypnogram-card-editor'

@customElement('hypnogram-card')
export class HypnogramCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private config!: HypnogramCardConfig

  public static getConfigElement(): HTMLElement {
    return document.createElement('hypnogram-card-editor')
  }

  public static getStubConfig(): Record<string, string> {
    return {
      title: 'Sleep rhythm',
      entity: '',
    }
  }

  public setConfig(config: HypnogramCardConfig): void {
    if (!config.entity) {
      throw new Error("You must define an 'entity'!")
    }
    this.config = {
      ...config,
      state_mapping: config.state_mapping || DEFAULT_STATE_MAPPING,
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
          Could not find entity: ${entityId}
        </ha-card>
      `
    }

    return html`
      <ha-card>
        <div class="header">
          ${this.config.title || 'Sleep rhythm (Hypnogram)'}
        </div>
        <div class="content">
          <p>Current status: <strong>${stateObj.state}</strong></p>
          <div class="chart-placeholder">
            Here we will draw the hypnogram based on the history...
          </div>
        </div>
      </ha-card>
    `
  }

  static styles = cardStyles
}

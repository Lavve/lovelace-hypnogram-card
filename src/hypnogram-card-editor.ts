import type { HomeAssistant } from 'custom-card-helpers'
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { editorStyles } from './styles'
import type { HypnogramCardConfig } from './types'

@customElement('hypnogram-card-editor')
export class HypnogramCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private _config!: HypnogramCardConfig

  public setConfig(config: HypnogramCardConfig): void {
    this._config = config
  }

  private get _sensorEntities(): string[] {
    if (!this.hass) return []
    return Object.keys(this.hass.states).filter((eid) =>
      eid.startsWith('sensor.'),
    )
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``
    }

    return html`
      <div class="card-config">
        <!-- Rubrik-fält -->
        <ha-textfield
          label="Title (Optional)"
          .value=${this._config.title || ''}
          .configValue=${'title'}
          @input=${this._valueChanged}
        ></ha-textfield>

        <!-- Entitets-väljare (Rullista med alla sensorer) -->
        <ha-combo-box
          label="Sleep data entity (Required)"
          .hass=${this.hass}
          .items=${this._sensorEntities}
          .value=${this._config.entity || ''}
          .configValue=${'entity'}
          @value-changed=${this._valueChanged}
          allow-custom-value
        ></ha-combo-box>
      </div>
    `
  }

  private _valueChanged(ev: CustomEvent | Event): void {
    if (!this._config || !this.hass) return

    const target = ev.target as any
    const configValue = target.configValue

    const newValue =
      target.value !== undefined
        ? target.value
        : (ev as CustomEvent).detail.value

    if (this._config[configValue] === newValue) return

    const newConfig = {
      ...this._config,
      [configValue]: newValue,
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  static styles = editorStyles
}

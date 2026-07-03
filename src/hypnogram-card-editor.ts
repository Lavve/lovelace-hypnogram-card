import type { HomeAssistant } from 'custom-card-helpers'
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { localize } from '@/localize'
import { editorStyles } from '@/styles'
import type { HypnogramCardConfig } from '@/types'

@customElement('hypnogram-card-editor')
export class HypnogramCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private _config!: HypnogramCardConfig

  public setConfig(config: HypnogramCardConfig): void {
    this._config = config
  }

  private get _schema() {
    const entities = Object.keys(this.hass.states)
      .filter((eid) => eid.startsWith('sensor.'))
      .sort()

    return [
      {
        name: 'title',
        selector: { text: {} },
      },
      {
        name: 'entity',
        required: true,
        selector: { entity: { include_entities: entities } },
      },
    ]
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``
    }

    const computeLabel = (schema: any) => {
      if (schema.name === 'title')
        return localize('editor.title_label', this.hass)
      if (schema.name === 'entity')
        return localize('editor.entity_label', this.hass)
      return schema.name
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value

    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  static styles = editorStyles
}

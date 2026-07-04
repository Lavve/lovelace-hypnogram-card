import type { HomeAssistant } from 'custom-card-helpers'
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
  CHART_CONFIG,
  clampBucketMinutes,
  DEFAULT_STATE_MAPPING,
} from '@/const'
import { localize } from '@/locales/localize'
import type { HaFormSchemaField, HypnogramCardConfig } from '@/types'
import { DEFAULT_PRIMARY_COLOR } from '@/utils/colors'

const STATE_MAPPING_PHASES = [
  'deep_sleep',
  'light_sleep',
  'rem',
  'awake',
] as const

@customElement('hypnogram-card-editor')
export class HypnogramCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant
  @state() private _config!: HypnogramCardConfig

  public setConfig(config: HypnogramCardConfig): void {
    this._config = {
      ...config,
      show_title: config.show_title ?? true,
      show_period_range: config.show_period_range ?? true,
      show_labels: config.show_labels ?? false,
      legend_position: config.legend_position ?? 'left',
      primary_color: config.primary_color ?? DEFAULT_PRIMARY_COLOR,
      bucket_minutes: clampBucketMinutes(config.bucket_minutes),
      tap_action: config.tap_action ?? { action: 'more-info' },
      hold_action: config.hold_action ?? { action: 'none' },
      double_tap_action: config.double_tap_action ?? { action: 'none' },
      state_mapping: {
        ...DEFAULT_STATE_MAPPING,
        ...config.state_mapping,
      },
    }
  }

  private get _schema(): HaFormSchemaField[] {
    const entities = Object.keys(this.hass.states)
      .filter((eid) => eid.startsWith('sensor.'))
      .sort()

    return [
      {
        name: 'entity',
        required: true,
        selector: { entity: { include_entities: entities } },
      },
      {
        type: 'expandable',
        name: 'display_options',
        icon: 'mdi:eye-outline',
        flatten: true,
        schema: [
          {
            name: 'title',
            selector: { text: {} },
            disabled: !this._config.show_title,
          },
          {
            name: 'show_title',
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_period_range',
            default: true,
            selector: { boolean: {} },
          },
          {
            name: 'show_labels',
            default: false,
            selector: { boolean: {} },
          },
          {
            name: 'legend_position',
            default: 'left',
            disabled: !this._config.show_labels,
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  {
                    value: 'left',
                    label: localize('editor.legend_position.left', this.hass),
                  },
                  {
                    value: 'right',
                    label: localize('editor.legend_position.right', this.hass),
                  },
                ],
              },
            },
          },
        ],
      },
      {
        type: 'expandable',
        name: 'state_mapping',
        icon: 'mdi:sleep',
        schema: STATE_MAPPING_PHASES.map((phase) => ({
          name: phase,
          required: true,
          default: DEFAULT_STATE_MAPPING[phase],
          selector: { text: {} },
        })),
      },
      {
        type: 'expandable',
        name: 'chart_configuration',
        icon: 'mdi:chart-line',
        flatten: true,
        schema: [
          {
            name: 'primary_color',
            default: DEFAULT_PRIMARY_COLOR,
            selector: { text: {} },
          },
          {
            name: 'bucket_minutes',
            default: CHART_CONFIG.bucketMinutes,
            selector: {
              number: {
                min: CHART_CONFIG.bucketMinutesMin,
                max: CHART_CONFIG.bucketMinutesMax,
                step: 1,
                mode: 'box',
              },
            },
          },
        ],
      },
      {
        type: 'expandable',
        name: 'interaction',
        icon: 'mdi:gesture-tap',
        flatten: true,
        schema: [
          {
            name: 'tap_action',
            default: { action: 'more-info' },
            selector: { ui_action: { default_action: 'more-info' } },
          },
          {
            name: 'hold_action',
            default: { action: 'none' },
            selector: { ui_action: {} },
          },
          {
            name: 'double_tap_action',
            default: { action: 'none' },
            selector: { ui_action: {} },
          },
        ],
      },
    ]
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``
    }

    const computeLabel = (schema: HaFormSchemaField) => {
      if (schema.name === 'title')
        return localize('editor.title_label', this.hass)
      if (schema.name === 'show_title')
        return localize('editor.show_title_label', this.hass)
      if (schema.name === 'show_period_range')
        return localize('editor.show_period_range_label', this.hass)
      if (schema.name === 'show_labels')
        return localize('editor.show_legends_label', this.hass)
      if (schema.name === 'legend_position')
        return localize('editor.legend_position_label', this.hass)
      if (schema.name === 'display_options')
        return localize('editor.display_options_label', this.hass)
      if (schema.name === 'entity')
        return localize('editor.entity_label', this.hass)
      if (schema.name === 'primary_color')
        return localize('editor.primary_color_label', this.hass)
      if (schema.name === 'bucket_minutes')
        return localize('editor.bucket_minutes_label', this.hass)
      if (schema.name === 'chart_configuration')
        return localize('editor.chart_configuration_label', this.hass)
      if (schema.name === 'tap_action')
        return localize('editor.tap_action_label', this.hass)
      if (schema.name === 'hold_action')
        return localize('editor.hold_action_label', this.hass)
      if (schema.name === 'double_tap_action')
        return localize('editor.double_tap_action_label', this.hass)
      if (schema.name === 'interaction')
        return localize('editor.interaction_label', this.hass)
      if (schema.name === 'state_mapping')
        return localize('editor.state_mapping_label', this.hass)
      if (
        schema.name &&
        STATE_MAPPING_PHASES.includes(
          schema.name as (typeof STATE_MAPPING_PHASES)[number],
        )
      ) {
        return localize(`editor.state_mapping.${schema.name}`, this.hass)
      }
      return schema.name ?? ''
    }

    const computeHelper = (schema: HaFormSchemaField) => {
      if (schema.name === 'primary_color')
        return localize('editor.primary_color_helper', this.hass)
      if (schema.name === 'bucket_minutes')
        return localize('editor.bucket_minutes_helper', this.hass)
      if (schema.name === 'state_mapping')
        return localize('editor.state_mapping_helper', this.hass)
      return undefined
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${computeLabel}
        .computeHelper=${computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value as HypnogramCardConfig
    this._config = config

    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }
}

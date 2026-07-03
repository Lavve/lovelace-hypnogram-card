import type { HomeAssistant } from "custom-card-helpers";
import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HypnogramCardConfig } from "./types/card";

// Registrerar kortet som en HTML-komponent: <hypnogram-card>
@customElement("hypnogram-card")
export class HypnogramCard extends LitElement {
  // Home Assistant skickar in hela sitt tillståndsobjekt (hass) här när något ändras
  @property({ attribute: false }) public hass!: HomeAssistant;

  // Kortets interna konfiguration
  @state() private config!: HypnogramCardConfig;

  // Sätter upp kortets konfiguration från Dashboard-YAML
  public setConfig(config: HypnogramCardConfig): void {
    if (!config.entity) {
      throw new Error("Du måste definiera en 'entity'!");
    }
    this.config = config;
  }

  // Bestämmer storleken på kortet (antal rader i grid-systemet)
  public getCardSize(): number {
    return 3;
  }

  // Kortets HTML-struktur
  protected render(): TemplateResult {
    if (!this.hass || !this.config) {
      return html``;
    }

    const entityId = this.config.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      return html`
        <ha-card class="error">
          Hittade inte entiteten: ${entityId}
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <div class="header">
          ${this.config.title || "Sömnrytm (Hypnogram)"}
        </div>
        <div class="content">
          <p>Nuvarande status från Sleep as Android: <strong>${stateObj.state}</strong></p>
          <div class="chart-placeholder">
            Här ska vi rita ut hypnogrammet baserat på historiken...
          </div>
        </div>
      </ha-card>
    `;
  }

  // Kortets CSS-styling (skugg-DOM så den inte krockar med övriga HA)
  static styles = css`
    ha-card {
      padding: 16px;
    }
    .header {
      font-size: 1.2em;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color);
    }
    .content {
      color: var(--primary-text-color);
    }
    .error {
      color: var(--error-color);
      background-color: var(--error-warning-background-color, #ffcccc);
      padding: 16px;
    }
    .chart-placeholder {
      border: 2px dashed var(--divider-color, #ccc);
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      margin-top: 12px;
    }
  `;
}

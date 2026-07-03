import { css } from 'lit'

export const cardStyles = css`
  :host {
    display: block;
  }
  ha-card {
    overflow: hidden;
  }
  .header {
    font-size: var(--ha-card-header-font-size, 1.2em);
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--primary-text-color);
  }
  .chart-area {
    position: relative;
    min-height: 150px;
  }
  .error .card-content {
    color: var(--error-color);
    background-color: var(--error-warning-background-color, #ffcccc);
  }
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
`

export const chartStyles = css`
  .chart-container {
    position: relative;
    width: 100%;
    min-height: 150px;
  }
  .chart {
    width: 100%;
    height: 150px;
    display: block;
  }
  .empty-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    font-size: 0.9em;
    pointer-events: none;
  }
  .phase-label {
    fill: var(--primary-text-color, #e0e0e0);
    font-size: 11px;
  }
  .time-label {
    fill: var(--secondary-text-color, #9e9e9e);
    font-size: 10px;
  }
  .grid-line {
    stroke: var(--divider-color, rgba(255, 255, 255, 0.25));
    stroke-width: 1;
  }
`

export const editorStyles = css`
  .card-config {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  ha-textfield, ha-combo-box {
    width: 100%;
  }
`

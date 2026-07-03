import { css } from 'lit'

export const cardStyles = css`
  ha-card {
    padding: 16px;
    overflow: hidden;
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
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
`

export const chartStyles = css`
  :host {
    display: block;
    width: 100%;
  }
  .chart {
    width: 100%;
    height: auto;
    display: block;
  }
  .phase-label {
    fill: var(--primary-text-color);
    font-size: 11px;
    opacity: 0.85;
  }
  .time-label {
    fill: var(--secondary-text-color);
    font-size: 10px;
  }
  .grid-line {
    stroke: var(--divider-color, rgba(255, 255, 255, 0.1));
    stroke-width: 0.5;
  }
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;
    color: var(--secondary-text-color);
    font-size: 0.9em;
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

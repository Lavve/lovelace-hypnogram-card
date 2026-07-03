import { css } from 'lit'

export const cardStyles = css`
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

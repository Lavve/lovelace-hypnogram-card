import { css } from 'lit'

import type { ChartPalette } from '@/types'
import {
  DEFAULT_PRIMARY_COLOR,
  derivePhaseColors,
  type PrimaryColorInput,
  resolvePrimaryColor,
} from '@/utils/colors'

export function buildChartPalette(
  primaryColor: PrimaryColorInput = DEFAULT_PRIMARY_COLOR,
  context?: HTMLElement,
): ChartPalette {
  const resolved = resolvePrimaryColor(primaryColor, context)
  const phaseColors = derivePhaseColors(
    resolved.source || DEFAULT_PRIMARY_COLOR,
    resolved.rgb,
  )

  return { phaseColors }
}

export const cardStyles = css`
  :host {
    display: block;
    height: 100%;
    min-height: 220px;
  }
  .card {
    background: var(
      --ha-card-background,
      var(--card-background-color, #1a1a1a)
    );
    border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 16px));
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, var(--divider-color, #2a2a2a));
    box-shadow: var(--ha-card-box-shadow, none);
    padding: 16px 16px 12px;
    height: 100%;
    min-height: 220px;
    box-sizing: border-box;
    color: var(--primary-text-color, #f0f0f0);
  }
  .card.interactive {
    cursor: pointer;
  }
  .card.interactive:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .header-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .header {
    font-size: 1.05em;
    font-weight: 600;
    color: var(--primary-text-color, #f0f0f0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .period-range {
    font-size: 0.8em;
    font-weight: 400;
    color: var(--secondary-text-color, #9a9a9a);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .chart-area {
    position: relative;
    min-height: 168px;
  }
  .error {
    color: var(--error-color);
    background-color: var(--error-warning-background-color, #ffcccc);
    padding: 16px;
    border-radius: 12px;
  }
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    color: var(--secondary-text-color, #9e9e9e);
    font-size: 0.9em;
    border-radius: 8px;
  }
`

export const chartStyles = css`
  .chart-container {
    box-sizing: border-box;
  }
  .bar {
    box-sizing: border-box;
    pointer-events: none;
  }
  .awake-line {
    box-sizing: border-box;
    pointer-events: none;
    z-index: 2;
  }
  .empty-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color, #9e9e9e);
    font-size: 0.9em;
    pointer-events: none;
    z-index: 3;
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

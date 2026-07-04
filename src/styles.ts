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
  const { rgb } = resolvePrimaryColor(primaryColor, context)
  const phaseColors = derivePhaseColors(rgb)

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
    font-weight: 600;
    font-size: var(--ha-font-size-l);
    color: var(--primary-text-color, #f0f0f0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }
  .period-range {
    font-size: var(--ha-font-size-s);
    font-weight: 400;
    color: var(--secondary-text-color, #9a9a9a);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .header.is-hidden,
  .period-range.is-hidden {
    visibility: hidden;
  }
  .chart-area {
    position: relative;
    min-height: 168px;
  }
  .chart-container.has-legends {
    display: flex;
    align-items: stretch;
  }
  .chart-container.legend-left {
    flex-direction: row;
  }
  .chart-container.legend-right {
    flex-direction: row-reverse;
  }
  .legends {
    flex: 0 0 auto;
    width: 4.75rem;
    box-sizing: border-box;
    font-size: var(--ha-font-size-s);
    line-height: 1.2;
    color: var(--secondary-text-color, #9e9e9e);
    position: relative;
    z-index: 1;
    position: absolute;
    height: 100%;
  }
  .chart-container.legend-left .legends {
    text-align: left;
  }
  .chart-container.legend-right .legends {
    text-align: right;
  }
  .legend {
    position: absolute;
    left: 2px;
    right: 2px;
    white-space: nowrap;
  }
  .legend.awake {
    top: 0;
  }
  .legend.rem {
    top: 25%;
  }
  .legend.light_sleep {
    top: 50%;
  }
  .legend.deep_sleep {
    top: 75%;
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
  .plot {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
  .chart-container:not(.has-legends) .plot {
    position: absolute;
    inset: 0;
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

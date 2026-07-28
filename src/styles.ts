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
  .header-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: flex-end;
    gap: 2px 12px;
    flex-shrink: 1;
    min-width: 0;
  }
  .period-range,
  .total-time,
  .sleep-efficiency,
  .sleep-cycles {
    font-size: var(--ha-font-size-s);
    font-weight: 400;
    color: var(--secondary-text-color, #9a9a9a);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .header.is-hidden,
  .period-range.is-hidden,
  .total-time.is-hidden {
    visibility: hidden;
  }
  .chart-area {
    position: relative;
    min-height: 168px;
  }
  .legends {
    position: absolute;
    top: 0;
    bottom: 0;
    width: max-content;
    min-width: 4.75rem;
    max-width: 45%;
    box-sizing: border-box;
    font-size: var(--ha-font-size-s);
    line-height: 1.2;
    color: var(--secondary-text-color, #9e9e9e);
    z-index: 1;
    pointer-events: none;
  }
  .chart-container.legend-left .legends {
    left: 0;
    text-align: left;
  }
  .chart-container.legend-right .legends {
    right: 0;
    text-align: right;
  }
  .chart-container.legend-with-values .legends {
    min-width: 6.5rem;
  }
  .chart-container.legend-format-both .legends {
    min-width: 9rem;
  }
  .chart-container.legend-format-duration .legends {
    min-width: 7.5rem;
  }
  .legend {
    position: absolute;
    white-space: nowrap;
  }
  .chart-container.legend-left .legend {
    left: 0;
    right: auto;
  }
  .chart-container.legend-right .legend {
    right: 0;
    left: auto;
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
  .legend-value {
    opacity: 0.85;
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
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 8px;
  }
  .bar {
    box-sizing: border-box;
    pointer-events: none;
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

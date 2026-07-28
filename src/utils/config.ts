import type { HypnogramCardConfig, LegendFormat } from '@/types'

function readLegacyLegendPercentages(config: HypnogramCardConfig): boolean {
  return (config as Record<string, unknown>).show_legend_percentages === true
}

export function resolveLegendFormat(config: HypnogramCardConfig): LegendFormat {
  if (config.legend_format) {
    return config.legend_format
  }
  if (readLegacyLegendPercentages(config)) {
    return 'percent'
  }
  return 'none'
}

export function normalizeHypnogramConfig(
  config: HypnogramCardConfig,
): HypnogramCardConfig {
  const next = {
    ...config,
    legend_format: resolveLegendFormat(config),
  } as Record<string, unknown>

  delete next.show_legend_percentages

  return next as HypnogramCardConfig
}

import type { LovelaceCardConfig } from "custom-card-helpers";

export interface HypnogramCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string;
  title?: string;
  state_mapping?: Record<string, string>;
}

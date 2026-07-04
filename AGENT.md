# Agent Context & Development Guidelines

This document serves as the persistent memory and architectural blueprint for the `hypnogram-card` Home Assistant custom Lovelace card project. Refer to this file to maintain codebase consistency, code style, and structural alignment.

Graphs should look similar to what is in the `/images/inspo.png`

---

## Technical Stack & Infrastructure

*   **Home assistant version:**
    *   Core: 2026.7.0 -
    *   Supervisor: 2026.06.02 -
    *   Operating system: 18.1 -
    *   Frontend: 20260624.3
*   **Framework:** Lit (v3.x) using TypeScript decorators (`@customElement`, `@property`, `@state`).
*   **Package Manager:** `pnpm` (Strict lockfile, node_linker/hard links setup).
*   **Code Quality & Formatting:** Biome (v2.x) configured as the exclusive linter and formatter.
*   **Bundler:** Rollup with `@rollup/plugin-typescript` and `@rollup/plugin-node-resolve`.
*   **Target Environment:** Home Assistant Frontend (Lovelace Dashboard Plugin).

---

## Code Style & Rules

1.  **Language:** All source code, variables, functions, types, and logging must be written in **English**.
2.  **No Comments:** Do not write boilerplate or explanatory comments inside the code files. Code must be self-documenting, clean, and declarative.
3.  **Formatting Constraints:**
    *   **Single Quotes Only:** (`quoteStyle: "single"`) for all string literals.
    *   **No Semicolons:** (`semicolons: "asNeeded"`), eliminate trailing semicolons unless structurally required by JavaScript ASI rules.
    *   **Indentation:** 2 spaces.

---

## Project Architecture & File Structure

```text
hypnogram-card/
├── src/
│   ├── locales/
│   │   ├── en.json               # English localization
│   │   └── sv.json               # Swedish localization
│   ├── services/
│   │   └── history.ts            # HA WebSocket API interactions & data transforms
│   ├── hypnogram-card.ts         # Main Lovelace card UI element (React-like controller)
│   ├── hypnogram-card-editor.ts  # GUI configuration panel using schema-driven <ha-form>
│   ├── types.ts                  # Shared TypeScript interfaces (YAML config shape, etc.)
│   ├── styles.ts                 # Extracted Lit CSS styles for card and editor components
│   ├── const.ts                  # Hardcoded constants and default mappings
│   └── localize.ts               # i18n localization dictionary (supports 'en', 'sv', etc.)
├── biome.json                    # Strict code style and formatting configurations (v2.5.2 schema)
├── rollup.config.js              # Build asset bundler config (ES modules layout)
├── tsconfig.json                 # TypeScript compiler specifications (target: es2022, moduleResolution: bundler)
└── package.json                  # Dependencies configuration ("type": "module" enabled)
```

## Domain Domain & Data Structuring

- **Primary Integration:** Optimized for Sleep as Android state-enum schemas, but designed agnostically via `state_mapping` parameters to support Apple Watch, Fitbit, or Withings structures.
- **Real-time & Long-term Data:** The card reads the live state machine via hass.states but computes the hypnogram by querying Home Assistant's history database asynchronously via the WebSocket API (`history/history_during_period`).

- **State Value Mapping Matrix:**
  - `awake` -> Level `4`
  - `rem` -> Level `3`
  - `light_sleep` -> Level `2`
  - `deep_sleep` -> Level `1`

## Workflow Workflow

- **Build command:** `pnpm build` outputs a single unified module to `dist/hypnogram-card.js`.
- **Format:** `pnpm run format` formats all files according to `biome.json`

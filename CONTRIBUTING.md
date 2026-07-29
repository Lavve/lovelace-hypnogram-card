# Contributing

Thanks for helping improve Hypnogram Card. Contributions are welcome in a few different ways:

1. Report bugs and share details.
2. Propose new features or improvements.
3. Add translations (UI localization).
4. Contribute code and documentation via pull requests.

## Reporting issues

When filing an issue, please include:

- The `entity` you configured the card with.
- Which Sleep as Android integration you use (official HA integration vs MQTT/custom).
- What you expected to see vs what you see instead.
- Any relevant screenshots (card config + the broken result).

If you have HA logs/debug output available, include those too.

## Code contributions

### Development setup

```bash
pnpm install
pnpm build      # outputs dist/hypnogram-card.js
pnpm watch      # rebuild on changes
pnpm lint       # check with Biome
```

For local testing in Home Assistant, copy `dist/hypnogram-card.js` to your HA `www/` folder.

### Pull request guidelines

- Keep PRs focused (one logical change at a time).
- Make sure lint passes (`pnpm lint`).
- Build succeeds (`pnpm build`).
- If you change behavior, document it in the README.

## Translations

The card follows your Home Assistant profile language. If a translation is missing, strings fall back to English.

To add a new language:

1. Copy `src/locales/en.ts` to `src/locales/<code>.ts` using the [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code (e.g. `de.ts` for German).
2. Translate every string value. Keep the keys unchanged.
3. Register the new locale in `src/locales/localize.ts`:
   - import your file
   - add it to the `languages` object with the same code
4. Run `pnpm format` and `pnpm build` to verify everything passes.
5. Submit the PR with the language name in the title (e.g. "Add German translation").

If your language has regional variants in Home Assistant (e.g. `pt-BR`), use the same code HA reports in `hass.locale.language`.


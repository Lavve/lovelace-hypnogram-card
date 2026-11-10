import type { HomeAssistant } from 'custom-card-helpers'
import de from '@/locales/languages/de'
import en from '@/locales/languages/en'
import nb from '@/locales/languages/nb'
import sv from '@/locales/languages/sv'

const languages: Record<string, Record<string, string>> = {
  de,
  en,
  nb,
  no: nb,
  sv,
}

export function localize(
  string: string,
  hass?: HomeAssistant,
  replacements?: Record<string, string | number>,
): string {
  const lang = hass?.locale?.language || hass?.language || 'en'

  let result: string
  try {
    result = languages[lang]?.[string] || languages.en[string] || string
  } catch {
    result = languages.en[string] || string
  }

  if (!replacements) {
    return result
  }

  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(`{${key}}`, String(value))
  }

  return result
}

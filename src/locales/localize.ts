import type { HomeAssistant } from 'custom-card-helpers'
import en from '@/locales/en'
import nb from '@/locales/nb'
import sv from '@/locales/sv'

const languages: Record<string, Record<string, string>> = {
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

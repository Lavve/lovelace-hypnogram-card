import type { HomeAssistant } from 'custom-card-helpers'
import en from '@/locales/en'
import sv from '@/locales/sv'

const languages: Record<string, Record<string, string>> = {
  en,
  sv,
}

export function localize(string: string, hass?: HomeAssistant): string {
  const lang = hass?.locale?.language || hass?.language || 'en'

  try {
    return languages[lang]?.[string] || languages.en[string] || string
  } catch {
    return languages.en[string] || string
  }
}

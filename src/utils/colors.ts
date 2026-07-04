import type { SleepPhase } from '@/types'

interface Rgb {
  r: number
  g: number
  b: number
}

interface Hsl {
  h: number
  s: number
  l: number
}

const PHASE_ORDER: SleepPhase[] = ['deep_sleep', 'light_sleep', 'rem', 'awake']

const DEFAULT_DERIVE_HUE = 195 / 360
const DEFAULT_DERIVE_SATURATION = 0.78
const DEFAULT_DERIVATION_LIGHTNESS = 0.63

export const DEFAULT_PRIMARY_COLOR = 'var(--primary-color)'

const LIGHT_MODE_THRESHOLD = 0.72
const DARK_MODE_THRESHOLD = 0.22

// Phase color tuning (HSL offsets from the configured primary color).
// rem is the anchor in normal mode; other phases shift lighter/darker around it.
//
// NORMAL_* — used when the primary color is mid-range (between the thresholds).
//   LIGHTNESS: negative = darker, positive = lighter. Smaller numbers = subtler steps.
//   SATURATION: 1 = unchanged; lower values mute that phase toward gray.
//
// LIGHT_MODE_DARKEN — primary is very light (>= LIGHT_MODE_THRESHOLD).
//   rem keeps the primary; lower phases darken by these amounts; awake lightens slightly.
//
// DARK_MODE_LIGHTEN — primary is very dark (<= DARK_MODE_THRESHOLD).
//   deep_sleep keeps the primary; higher phases lighten by these amounts.
const NORMAL_LIGHTNESS_OFFSET: Record<SleepPhase, number> = {
  deep_sleep: -0.15,
  light_sleep: -0.08,
  rem: 0,
  awake: 0.12,
}

const NORMAL_SATURATION_SCALE: Record<SleepPhase, number> = {
  deep_sleep: 0.88,
  light_sleep: 0.92,
  rem: 0.98,
  awake: 1,
}

const LIGHT_MODE_DARKEN: Record<SleepPhase, number> = {
  deep_sleep: 0.17,
  light_sleep: 0.09,
  rem: 0,
  awake: 0.04,
}

const DARK_MODE_LIGHTEN: Record<SleepPhase, number> = {
  deep_sleep: 0,
  light_sleep: 0.1,
  rem: 0.17,
  awake: 0.24,
}

export type PrimaryColorInput = string | number[] | undefined

function parseHexColor(input: string): Rgb | null {
  const normalized = input.trim().toLowerCase()
  const match = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)
  if (!match) return null

  let hex = match[1]
  if (hex.length === 3) {
    hex = [...hex].map((char) => char + char).join('')
  }

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function channelToByte(value: string, isPercent: boolean): number {
  const parsed = Number.parseFloat(value)
  const scaled = isPercent ? (parsed / 100) * 255 : parsed
  return Math.min(255, Math.max(0, Math.round(scaled)))
}

function parseRgbColor(input: string): Rgb | null {
  const trimmed = input.trim()
  const hex = parseHexColor(trimmed)
  if (hex) return hex

  const match = trimmed.match(
    /^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)/i,
  )
  if (!match) return null

  const toChannel = (value: string) =>
    channelToByte(value, value.trim().endsWith('%'))

  return {
    r: toChannel(match[1]),
    g: toChannel(match[2]),
    b: toChannel(match[3]),
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness }
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  let hue = 0
  switch (max) {
    case rn:
      hue = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6
      break
    case gn:
      hue = ((bn - rn) / delta + 2) / 6
      break
    default:
      hue = ((rn - gn) / delta + 4) / 6
      break
  }

  return { h: hue, s: saturation, l: lightness }
}

function hslToHex({ h, s, l }: Hsl): string {
  const hue = ((h % 1) + 1) % 1
  const saturation = Math.min(1, Math.max(0, s))
  const lightness = Math.min(1, Math.max(0, l))

  if (saturation === 0) {
    const channel = Math.round(lightness * 255)
    return `#${channel.toString(16).padStart(2, '0').repeat(3)}`
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation
  const p = 2 * lightness - q

  const toChannel = (t: number) => {
    const tone = ((t % 1) + 1) % 1
    if (tone < 1 / 6) return p + (q - p) * 6 * tone
    if (tone < 1 / 2) return q
    if (tone < 2 / 3) return p + (q - p) * (2 / 3 - tone) * 6
    return p
  }

  const r = Math.round(toChannel(hue + 1 / 3) * 255)
  const g = Math.round(toChannel(hue) * 255)
  const b = Math.round(toChannel(hue - 1 / 3) * 255)

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function normalizePrimaryColor(color: PrimaryColorInput): string | undefined {
  if (!color) return undefined
  if (typeof color === 'string') {
    const trimmed = color.trim()
    return trimmed || undefined
  }
  if (Array.isArray(color) && color.length >= 3) {
    const [r, g, b] = color
    return rgbToHex({
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
    })
  }
  return undefined
}

function resolveCssColor(color: string, context?: HTMLElement): string | null {
  if (typeof window === 'undefined') return null

  const probe = document.createElement('span')
  probe.style.display = 'none'
  probe.style.color = color

  const mount =
    /var\s*\(/i.test(color) || !context?.isConnected
      ? document.documentElement
      : context

  mount.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  mount.removeChild(probe)

  return resolved && resolved !== 'rgba(0, 0, 0, 0)' ? resolved : null
}

export function resolvePrimaryColor(
  color: PrimaryColorInput,
  context?: HTMLElement,
): { source: string; rgb: Rgb | null } {
  const source = normalizePrimaryColor(color)
  if (!source) return { source: '', rgb: null }

  const direct = parseRgbColor(source)
  if (direct) return { source, rgb: direct }

  const resolved = resolveCssColor(source, context)
  if (resolved) {
    const rgb = parseRgbColor(resolved)
    if (rgb) return { source, rgb }
  }

  return { source, rgb: null }
}

function defaultDerivationRgb(): Rgb {
  return (
    parseHexColor(
      hslToHex({
        h: DEFAULT_DERIVE_HUE,
        s: DEFAULT_DERIVE_SATURATION,
        l: DEFAULT_DERIVATION_LIGHTNESS,
      }),
    ) ?? { r: 69, g: 212, b: 255 }
  )
}

function resolveHueAndSaturation(hsl: Hsl): { h: number; s: number } {
  if (hsl.s < 0.08) {
    return { h: DEFAULT_DERIVE_HUE, s: DEFAULT_DERIVE_SATURATION }
  }
  return { h: hsl.h, s: hsl.s }
}

function clampLightness(value: number): number {
  return Math.min(0.92, Math.max(0.12, value))
}

function phaseFromHsl(
  h: number,
  s: number,
  l: number,
  saturationScale = 1,
): string {
  return hslToHex({
    h,
    s: Math.min(1, s * saturationScale),
    l: clampLightness(l),
  })
}

function deriveNormalPalette(
  h: number,
  s: number,
  baseLightness: number,
): Record<SleepPhase, string> {
  const colors = {} as Record<SleepPhase, string>
  for (const phase of PHASE_ORDER) {
    colors[phase] = phaseFromHsl(
      h,
      s,
      baseLightness + NORMAL_LIGHTNESS_OFFSET[phase],
      NORMAL_SATURATION_SCALE[phase],
    )
  }
  return colors
}

function deriveLightPalette(
  h: number,
  s: number,
  remLightness: number,
): Record<SleepPhase, string> {
  const colors = {} as Record<SleepPhase, string>
  for (const phase of PHASE_ORDER) {
    if (phase === 'awake') {
      colors.awake = phaseFromHsl(
        h,
        s,
        Math.min(0.95, remLightness + LIGHT_MODE_DARKEN.awake),
        NORMAL_SATURATION_SCALE.awake,
      )
      continue
    }

    const target = Math.max(
      0.12,
      remLightness - LIGHT_MODE_DARKEN[phase as keyof typeof LIGHT_MODE_DARKEN],
    )
    colors[phase] = phaseFromHsl(h, s, target, NORMAL_SATURATION_SCALE[phase])
  }
  return colors
}

function deriveDarkPalette(
  h: number,
  s: number,
  deepLightness: number,
): Record<SleepPhase, string> {
  const colors = {} as Record<SleepPhase, string>
  for (const phase of PHASE_ORDER) {
    const target = Math.min(
      0.92,
      deepLightness +
        DARK_MODE_LIGHTEN[phase as keyof typeof DARK_MODE_LIGHTEN],
    )
    colors[phase] = phaseFromHsl(h, s, target, NORMAL_SATURATION_SCALE[phase])
  }
  return colors
}

export function derivePhaseColors(rgb: Rgb | null): Record<SleepPhase, string> {
  const derivationRgb = rgb ?? defaultDerivationRgb()
  const hsl = rgbToHsl(derivationRgb)
  const { h, s } = resolveHueAndSaturation(hsl)

  if (hsl.l >= LIGHT_MODE_THRESHOLD) {
    return deriveLightPalette(h, s, hsl.l)
  }

  if (hsl.l <= DARK_MODE_THRESHOLD) {
    return deriveDarkPalette(h, s, hsl.l)
  }

  return deriveNormalPalette(h, s, hsl.l)
}

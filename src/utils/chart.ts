import { CHART_CONFIG } from '@/const'
import type { ChartDimensions, SleepSegment } from '@/types'

interface LayoutSegment extends SleepSegment {
  layoutStartMs: number
  layoutEndMs: number
}

interface CompressedChartLayout {
  bars: LayoutSegment[]
  awakeLineMs: number[]
  layoutStartMs: number
  layoutEndMs: number
}

export function getChartDimensions(
  width: number,
  height = CHART_CONFIG.height,
): ChartDimensions {
  const padding = { ...CHART_CONFIG.padding }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const levelHeight = plotHeight / 4
  const barHeight = levelHeight

  return {
    width,
    height,
    padding,
    plotWidth,
    plotHeight,
    levelHeight,
    barHeight,
  }
}

function timeToX(
  timeMs: number,
  startMs: number,
  endMs: number,
  dims: ChartDimensions,
): number {
  const duration = endMs - startMs
  if (duration <= 0) return dims.padding.left

  const ratio = (timeMs - startMs) / duration
  return dims.padding.left + ratio * dims.plotWidth
}

function levelToY(level: number, dims: ChartDimensions): number {
  return dims.padding.top + (4 - level) * dims.levelHeight
}

export function buildCompressedLayout(
  segments: SleepSegment[],
): CompressedChartLayout {
  const bars: LayoutSegment[] = []
  const awakeLineMs: number[] = []
  let compressed = 0

  for (const segment of segments) {
    if (segment.state === 'awake') {
      awakeLineMs.push(compressed)
      continue
    }

    const duration = segment.endMs - segment.startMs
    if (duration <= 0) continue

    bars.push({
      ...segment,
      layoutStartMs: compressed,
      layoutEndMs: compressed + duration,
    })
    compressed += duration
  }

  return {
    bars,
    awakeLineMs,
    layoutStartMs: 0,
    layoutEndMs: compressed,
  }
}

export function getLayoutSegmentRect(
  segment: LayoutSegment,
  layoutStartMs: number,
  layoutEndMs: number,
  dims: ChartDimensions,
): { x: number; y: number; width: number; height: number } {
  const x = timeToX(segment.layoutStartMs, layoutStartMs, layoutEndMs, dims)
  const xEnd = timeToX(segment.layoutEndMs, layoutStartMs, layoutEndMs, dims)
  const plotBottom = dims.padding.top + dims.plotHeight
  const levelTop = levelToY(segment.level, dims)

  return {
    x,
    y: levelTop,
    width: Math.max(xEnd - x, 1),
    height: plotBottom - levelTop,
  }
}

export function getAwakeLineAtX(
  layoutMs: number,
  layoutStartMs: number,
  layoutEndMs: number,
  dims: ChartDimensions,
  lineWidthPx = 2,
): { x: number; y: number; width: number; height: number } {
  const x = timeToX(layoutMs, layoutStartMs, layoutEndMs, dims)

  return {
    x,
    y: dims.padding.top,
    width: lineWidthPx,
    height: dims.plotHeight,
  }
}

export function getAdjacentBarSegments(
  segments: SleepSegment[],
  index: number,
): { prev?: SleepSegment; next?: SleepSegment } {
  let prev: SleepSegment | undefined
  for (let i = index - 1; i >= 0; i--) {
    if (segments[i].state !== 'awake') {
      prev = segments[i]
      break
    }
  }

  let next: SleepSegment | undefined
  for (let i = index + 1; i < segments.length; i++) {
    if (segments[i].state !== 'awake') {
      next = segments[i]
      break
    }
  }

  return { prev, next }
}

export function getBarStepRadii(
  segment: SleepSegment,
  prev?: SleepSegment,
  next?: SleepSegment,
  radiusPx = 4,
): { borderTopLeftRadius: string; borderTopRightRadius: string } {
  const radius = `${radiusPx}px`

  return {
    borderTopLeftRadius: prev && prev.level < segment.level ? radius : '0',
    borderTopRightRadius: next && next.level < segment.level ? radius : '0',
  }
}

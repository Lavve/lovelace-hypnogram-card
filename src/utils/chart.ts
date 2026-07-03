import { CHART_CONFIG } from '@/const'
import type { ChartDimensions, SleepSegment } from '@/types'

export function getChartDimensions(
  width: number,
  height = CHART_CONFIG.height,
): ChartDimensions {
  const padding = { ...CHART_CONFIG.padding }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const levelHeight = plotHeight / 4
  const barHeight = levelHeight * CHART_CONFIG.barHeightRatio

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

export function timeToX(
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

export function levelToY(level: number, dims: ChartDimensions): number {
  return dims.padding.top + (4 - level) * dims.levelHeight
}

export function getSegmentRect(
  segment: SleepSegment,
  periodStartMs: number,
  periodEndMs: number,
  dims: ChartDimensions,
): { x: number; y: number; width: number; height: number } {
  const x = timeToX(segment.startMs, periodStartMs, periodEndMs, dims)
  const xEnd = timeToX(segment.endMs, periodStartMs, periodEndMs, dims)
  const y = levelToY(segment.level, dims)

  return {
    x,
    y: y + (dims.levelHeight - dims.barHeight) / 2,
    width: Math.max(xEnd - x, 1),
    height: dims.barHeight,
  }
}

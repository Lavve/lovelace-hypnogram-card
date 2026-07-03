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
  time: Date,
  start: Date,
  end: Date,
  dims: ChartDimensions,
): number {
  const duration = end.getTime() - start.getTime()
  if (duration <= 0) return dims.padding.left

  const ratio = (time.getTime() - start.getTime()) / duration
  return dims.padding.left + ratio * dims.plotWidth
}

export function levelToY(level: number, dims: ChartDimensions): number {
  return dims.padding.top + (4 - level) * dims.levelHeight
}

export function getSegmentRect(
  segment: SleepSegment,
  periodStart: Date,
  periodEnd: Date,
  dims: ChartDimensions,
): { x: number; y: number; width: number; height: number } {
  const x = timeToX(segment.startTime, periodStart, periodEnd, dims)
  const xEnd = timeToX(segment.endTime, periodStart, periodEnd, dims)
  const y = levelToY(segment.level, dims)

  return {
    x,
    y: y + (dims.levelHeight - dims.barHeight) / 2,
    width: Math.max(xEnd - x, 1),
    height: dims.barHeight,
  }
}

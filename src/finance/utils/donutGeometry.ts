// Geometry of the budget donut. Angles are in degrees, clockwise from 12 o'clock, like a clock face.

export interface DonutSegment {
  startAngle: number
  endAngle: number
}

/** A whole ring can't be drawn as one arc (its ends meet), so anything this close to 360° is drawn as two halves. */
const FULL_CIRCLE = 359.999

/** Each share's segment, laid out one after the other. `shares` are percents adding up to 100. */
export function donutSegments(shares: number[]): DonutSegment[] {
  let start = 0

  return shares.map((share) => {
    const segment = { startAngle: start, endAngle: start + (share * 360) / 100 }
    start = segment.endAngle
    return segment
  })
}

function format(value: number) {
  // Three places are far below a pixel and keep the path short; `+` also turns -0 into 0.
  return String(+value.toFixed(3))
}

function point(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180
  return `${format(cx + radius * Math.sin(radians))} ${format(cy - radius * Math.cos(radians))}`
}

/** The SVG path of a ring sector between two radii; empty for an empty segment. */
export function donutArcPath(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) {
  const sweep = endAngle - startAngle
  if (sweep <= 0) return ''

  const outer = `${format(outerRadius)} ${format(outerRadius)}`
  const inner = `${format(innerRadius)} ${format(innerRadius)}`

  if (sweep >= FULL_CIRCLE) {
    // Outer ring clockwise, inner ring counterclockwise: the inner one cuts the hole out.
    return [
      `M ${point(cx, cy, outerRadius, 0)}`,
      `A ${outer} 0 1 1 ${point(cx, cy, outerRadius, 180)}`,
      `A ${outer} 0 1 1 ${point(cx, cy, outerRadius, 0)} Z`,
      `M ${point(cx, cy, innerRadius, 0)}`,
      `A ${inner} 0 1 0 ${point(cx, cy, innerRadius, 180)}`,
      `A ${inner} 0 1 0 ${point(cx, cy, innerRadius, 0)} Z`,
    ].join(' ')
  }

  const largeArc = sweep > 180 ? 1 : 0

  return [
    `M ${point(cx, cy, outerRadius, startAngle)}`,
    `A ${outer} 0 ${largeArc} 1 ${point(cx, cy, outerRadius, endAngle)}`,
    `L ${point(cx, cy, innerRadius, endAngle)}`,
    `A ${inner} 0 ${largeArc} 0 ${point(cx, cy, innerRadius, startAngle)}`,
    'Z',
  ].join(' ')
}

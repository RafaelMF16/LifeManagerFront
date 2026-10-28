import { useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { niceMax } from '../../../finance/utils/chartScale'
import Button from '../../../shared/components/Button/Button'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import { usePlayerEvolution } from '../../hooks/usePlayerEvolution'
import type { EvolutionRange } from '../../types/PlayerProfileDtos'
import type { EvolutionSeries } from '../../utils/playerProfile'
import { evolutionValue, isEmptyEvolution, nearestPointIndex, periodSummary, signedNumber, weeklyPoints } from '../../utils/playerProfile'
import './EvolutionChart.css'

const RANGES: EvolutionRange[] = ['Month', 'Quarter', 'Year']
const SERIES: EvolutionSeries[] = ['xp', 'coins']

// The SVG's own units; it stretches to the card's width, and the line keeps 2px with non-scaling-stroke.
const WIDTH = 600
const HEIGHT = 180
const GRID_FRACTIONS = [1, 0.5, 0]

/**
 * The player's XP total or coin balance at the end of each day, one series at a time (they have different scales).
 * Hover, tap or the arrow keys pick a day for the readout; a visually hidden table carries a point a week.
 */
function EvolutionChart() {
  const { t: translate, i18n } = useTranslation('habits')
  const [range, setRange] = useState<EvolutionRange>('Quarter')
  const [series, setSeries] = useState<EvolutionSeries>('xp')
  // null follows the last day, so a new range or a reload always starts on today.
  const [picked, setPicked] = useState<number | null>(null)
  const evolution = usePlayerEvolution(range)
  const points = evolution.data?.points ?? []

  const numberFormat = new Intl.NumberFormat(i18n.language)
  const dayFormat = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const fullDayFormat = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const formatDay = (date: string, full = false) => (full ? fullDayFormat : dayFormat).format(new Date(`${date}T00:00:00Z`))
  const formatValue = (value: number) =>
    translate(`habits:profile.evolution.values.${series}`, { value: numberFormat.format(value), count: value })

  const selectedIndex = Math.min(picked ?? points.length - 1, points.length - 1)
  const selected = points[selectedIndex]
  const scaleMax = niceMax(Math.max(0, ...points.map((point) => evolutionValue(point, series))))
  const x = (index: number) => (points.length > 1 ? (index / (points.length - 1)) * WIDTH : WIDTH / 2)
  const y = (value: number) => HEIGHT - (Math.max(value, 0) / scaleMax) * HEIGHT
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(evolutionValue(point, series)).toFixed(1)}`).join('')
  const summary = periodSummary(points, series)
  const seriesName = translate(`habits:profile.evolution.series.${series}`)

  function pick(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    setPicked(nearestPointIndex(event.clientX - box.left, box.width, points.length))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = { ArrowLeft: selectedIndex - 1, ArrowRight: selectedIndex + 1, Home: 0, End: points.length - 1 }
    if (!(event.key in moves)) return
    event.preventDefault()
    setPicked(Math.min(Math.max(moves[event.key], 0), points.length - 1))
  }

  function changeRange(next: EvolutionRange) {
    setRange(next)
    setPicked(null)
  }

  function renderPlot() {
    if (!evolution.data) {
      return (
        <div className="lm-evolution__state">
          {evolution.status === 'error' ? (
            <>
              {translate('habits:profile.evolution.loadError')}
              <Button variant="secondary" size="sm" onClick={evolution.reload}>
                {translate('habits:profile.retry')}
              </Button>
            </>
          ) : (
            translate('habits:profile.evolution.loading')
          )}
        </div>
      )
    }

    return (
      <>
        {selected ? (
          <div className="lm-evolution__readout" aria-live="polite">
            <span className="lm-evolution__readout-value">{formatValue(evolutionValue(selected, series))}</span>
            <span className="lm-evolution__readout-date">{formatDay(selected.date, true)}</span>
          </div>
        ) : null}

        <div className="lm-evolution__plot">
          <div className="lm-evolution__grid" aria-hidden="true">
            {GRID_FRACTIONS.map((fraction) => (
              <span key={fraction} className="lm-evolution__gridline" style={{ top: `${(1 - fraction) * 100}%` }}>
                <span className="lm-evolution__gridlabel">{numberFormat.format(scaleMax * fraction)}</span>
              </span>
            ))}
          </div>
          <div
            className="lm-evolution__canvas"
            role="slider"
            tabIndex={0}
            aria-label={translate('habits:profile.evolution.plotAria', { series: seriesName })}
            aria-valuemin={0}
            aria-valuemax={Math.max(points.length - 1, 0)}
            aria-valuenow={selectedIndex}
            aria-valuetext={selected ? `${formatDay(selected.date, true)}: ${formatValue(evolutionValue(selected, series))}` : undefined}
            onPointerMove={pick}
            onPointerDown={pick}
            onKeyDown={onKeyDown}
          >
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="lm-evolution__svg" aria-hidden="true">
              <path d={path} className={`lm-evolution__line lm-evolution__line--${series}`} vectorEffect="non-scaling-stroke" />
              {selected ? (
                <line x1={x(selectedIndex)} x2={x(selectedIndex)} y1={0} y2={HEIGHT} className="lm-evolution__crosshair" vectorEffect="non-scaling-stroke" />
              ) : null}
            </svg>
            {selected ? (
              <span
                className={`lm-evolution__dot lm-evolution__dot--${series}`}
                style={{ left: `${(x(selectedIndex) / WIDTH) * 100}%`, top: `${(y(evolutionValue(selected, series)) / HEIGHT) * 100}%` }}
                aria-hidden="true"
              />
            ) : null}
          </div>
          {points.length > 0 ? (
            <div className="lm-evolution__axis" aria-hidden="true">
              <span>{formatDay(points[0].date)}</span>
              <span>{formatDay(points[points.length - 1].date)}</span>
            </div>
          ) : null}
        </div>

        {isEmptyEvolution(points) ? (
          <p className="lm-evolution__hint">{translate('habits:profile.evolution.empty')}</p>
        ) : (
          <p className="lm-evolution__summary">
            <strong>
              {translate(`habits:profile.evolution.changes.${series}`, { change: signedNumber(summary.change, numberFormat), count: Math.abs(summary.change) })}
            </strong>
            <span>
              {translate('habits:profile.evolution.fromTo', { start: formatValue(summary.start), end: formatValue(summary.end) })}
            </span>
          </p>
        )}

        <table className="lm-evolution__table">
          <caption>{translate('habits:profile.evolution.tableCaption', { series: seriesName })}</caption>
          <thead>
            <tr>
              <th scope="col">{translate('habits:profile.evolution.day')}</th>
              <th scope="col">{seriesName}</th>
            </tr>
          </thead>
          <tbody>
            {weeklyPoints(points).map((point) => (
              <tr key={point.date}>
                <td>{formatDay(point.date, true)}</td>
                <td>{formatValue(evolutionValue(point, series))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  return (
    <div className={`lm-evolution${evolution.isFetching && evolution.data ? ' lm-evolution--fetching' : ''}`}>
      <div className="lm-evolution__controls">
        <SegmentedControl
          aria-label={translate('habits:profile.evolution.seriesAria')}
          size="md"
          value={series}
          onChange={setSeries}
          options={SERIES.map((value) => ({ value, label: translate(`habits:profile.evolution.series.${value}`) }))}
        />
        <SegmentedControl
          aria-label={translate('habits:profile.evolution.rangeAria')}
          size="md"
          value={range}
          onChange={changeRange}
          options={RANGES.map((value) => ({ value, label: translate(`habits:profile.evolution.ranges.${value}`) }))}
        />
      </div>
      {renderPlot()}
    </div>
  )
}

export default EvolutionChart

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { HabitKind } from '../../types/HabitDtos'
import type { HabitDayDto, HabitDayState } from '../../types/HabitStatsDtos'
import { formatHeatmapDay, heatmapWeeks, monthLabels, stateCounts } from '../../utils/heatmap'
import './HabitHeatmap.css'

/** Legend order: kept, protected, failed, then the neutral states. Before-start days aren't listed. */
const LEGEND_ORDER: HabitDayState[] = ['Done', 'Clean', 'Frozen', 'Missed', 'Relapse', 'Pending', 'Off', 'None']

/** Rows that carry a weekday label (Monday, Wednesday, Friday), like a calendar heatmap. */
const LABELLED_ROWS = [0, 2, 4]

// 2026-10-05 is a Monday: its week gives the weekday names in the UI language.
const MONDAY = Date.UTC(2026, 9, 5)

interface HabitHeatmapProps {
  /** Oldest first, ending today. */
  days: HabitDayDto[]
  /** A habit to avoid calls its days off "free" rather than "off". */
  kind: HabitKind
}

/**
 * The habit's last 13 weeks as a calendar: one column per week, Monday on top, each day colored by what happened
 * (kept, protected, failed; neutral when nothing was due or recorded). Tapping or hovering a day reads it out below; the
 * legend counts the days per state, so the colors are never the only way to read it.
 */
function HabitHeatmap({ days, kind }: HabitHeatmapProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const [selected, setSelected] = useState<HabitDayDto | null>(null)
  const weeks = heatmapWeeks(days)
  const months = monthLabels(weeks, i18n.language)
  const counts = stateCounts(days)
  const weekdayFormat = new Intl.DateTimeFormat(i18n.language, { weekday: 'short', timeZone: 'UTC' })

  const stateLabel = (state: HabitDayState) =>
    translate(state === 'Off' && kind === 'Negative' ? 'habits:details.states.Free' : `habits:details.states.${state}`)
  const dayLabel = (day: HabitDayDto) => `${formatHeatmapDay(day.date, i18n.language)}: ${stateLabel(day.state)}`
  const readout = selected ?? days[days.length - 1]

  return (
    <div className="lm-heatmap">
      <div
        className="lm-heatmap__grid"
        style={{ gridTemplateColumns: `var(--heatmap-label-width) repeat(${weeks.length}, minmax(0, 1fr))` }}
        onPointerLeave={() => setSelected(null)}
      >
        <span aria-hidden="true" />
        {months.map((month, index) => (
          <span key={`month-${index}`} className="lm-heatmap__month" aria-hidden="true">
            {month}
          </span>
        ))}

        {Array.from({ length: 7 }, (_, row) => (
          <div key={`row-${row}`} className="lm-heatmap__row" role="presentation">
            <span className="lm-heatmap__weekday" aria-hidden="true">
              {LABELLED_ROWS.includes(row) ? weekdayFormat.format(new Date(MONDAY + row * 86_400_000)).replace('.', '') : ''}
            </span>
            {weeks.map((week, column) => {
              const day = week[row]
              if (!day) return <span key={`empty-${column}`} className="lm-heatmap__cell lm-heatmap__cell--outside" aria-hidden="true" />

              return (
                <span
                  key={day.date}
                  role="img"
                  aria-label={dayLabel(day)}
                  title={dayLabel(day)}
                  className={[
                    'lm-heatmap__cell',
                    `lm-heatmap__cell--${day.state.toLowerCase()}`,
                    day === days[days.length - 1] ? 'lm-heatmap__cell--today' : '',
                    readout === day ? 'lm-heatmap__cell--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onPointerEnter={() => setSelected(day)}
                  onClick={() => setSelected(day)}
                />
              )
            })}
          </div>
        ))}
      </div>

      {readout ? (
        <p className="lm-heatmap__readout" aria-live="polite">
          <span className={`lm-heatmap__swatch lm-heatmap__cell--${readout.state.toLowerCase()}`} aria-hidden="true" />
          {dayLabel(readout)}
        </p>
      ) : null}

      <ul className="lm-heatmap__legend" aria-label={translate('habits:details.heatmap.legend')}>
        {LEGEND_ORDER.filter((state) => counts[state]).map((state) => (
          <li key={state} className="lm-heatmap__legend-item">
            <span className={`lm-heatmap__swatch lm-heatmap__cell--${state.toLowerCase()}`} aria-hidden="true" />
            <span>{stateLabel(state)}</span>
            <span className="lm-heatmap__legend-count">{counts[state]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HabitHeatmap

import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import { usePrivacyMode } from '../../hooks/usePrivacyMode'
import type { DashboardCategoryBreakdownDto, DashboardMonthDto } from '../../types/DashboardDtos'
import { barRatio } from '../../utils/chartScale'
import Amount from '../Amount/Amount'
import DashboardChange from '../DashboardChange/DashboardChange'
import './CategoryRanking.css'

/** Hidden share bars all get this length: their real lengths would give the proportions away. */
const HIDDEN_BAR_RATIO = 0.5

const OTHERS_KEY = 'others'

interface RankingRow {
  key: string
  name: string
  amount: number
  previousAmount: number
  changeRatio: number | null
  share: number
  monthlyAmounts: number[]
}

interface CategoryRankingProps {
  kind: 'expense' | 'investment'
  breakdown: DashboardCategoryBreakdownDto
  /** The period's months, in the same order as each category's `monthlyAmounts`. */
  months: DashboardMonthDto[]
  /** The comparison period, e.g. "Abr – Set 2025". */
  comparisonRange: string
}

/**
 * A type's categories, biggest first, each with its share of the total and how it moved. A row opens in place
 * to show the category's amount in each month and in the comparison period.
 */
function CategoryRanking({ kind, breakdown, months, comparisonRange }: CategoryRankingProps) {
  const { t: translate } = useTranslation('finance')
  const { percent, periodLabel } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const titleId = useId()
  const panelIdPrefix = useId()
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const tone = kind === 'expense' ? 'negative' : 'investment'
  const title = translate(
    kind === 'expense' ? 'finance:dashboard.categories.expensesTitle' : 'finance:dashboard.categories.investmentsTitle',
  )

  const rows: RankingRow[] = breakdown.items.map((item) => ({ key: String(item.categoryId), ...item }))
  if (breakdown.others) {
    rows.push({
      key: OTHERS_KEY,
      name: translate('finance:dashboard.categories.others', { count: breakdown.others.categoryCount }),
      ...breakdown.others,
    })
  }

  function ratioStyle(ratio: number): CSSProperties {
    return { '--lm-bar': hidden ? HIDDEN_BAR_RATIO : ratio } as CSSProperties
  }

  return (
    <section
      className={`lm-category-ranking lm-category-ranking--${kind}${hidden ? ' lm-category-ranking--hidden' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="lm-category-ranking__header">
        <h2 id={titleId} className="lm-category-ranking__title">
          {title}
        </h2>
        {rows.length > 0 ? <Amount value={breakdown.total} tone={tone} emphasis /> : null}
      </div>

      {rows.length === 0 ? (
        <p className="lm-category-ranking__empty">
          {translate(
            kind === 'expense'
              ? 'finance:dashboard.categories.emptyExpenses'
              : 'finance:dashboard.categories.emptyInvestments',
          )}
        </p>
      ) : (
        <ul className="lm-category-ranking__list">
          {rows.map((row) => {
            const expanded = expandedKey === row.key
            const panelId = `${panelIdPrefix}-${row.key}`
            const monthMax = Math.max(0, ...row.monthlyAmounts)

            return (
              <li key={row.key} className="lm-category-ranking__item">
                <button
                  type="button"
                  className="lm-category-ranking__row"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setExpandedKey(expanded ? null : row.key)}
                >
                  <span className="lm-category-ranking__name">{row.name}</span>
                  <Amount value={row.amount} tone={tone} className="lm-category-ranking__amount" />
                  <span className="lm-category-ranking__track" aria-hidden="true">
                    <span className="lm-category-ranking__fill" style={ratioStyle(row.share)} />
                  </span>
                  <span className="lm-category-ranking__meta">
                    <span className="lm-numeric">
                      {translate('finance:dashboard.categories.shareOfTotal', { percent: percent(row.share) })}
                    </span>
                    <DashboardChange
                      changeRatio={row.changeRatio}
                      difference={row.amount - row.previousAmount}
                      comparisonRange={comparisonRange}
                    />
                  </span>
                  <Icon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    aria-hidden="true"
                    className="lm-category-ranking__chevron"
                  />
                </button>

                {expanded ? (
                  <div id={panelId} className="lm-category-ranking__panel">
                    <span className="lm-category-ranking__panel-title">
                      {translate('finance:dashboard.categories.byMonth')}
                    </span>
                    <ul className="lm-category-ranking__months">
                      {months.map((month, index) => (
                        <li key={`${month.year}-${month.month}`} className="lm-category-ranking__month">
                          <span className="lm-category-ranking__month-name">{periodLabel(month.month, month.year)}</span>
                          <span className="lm-category-ranking__month-track" aria-hidden="true">
                            <span
                              className="lm-category-ranking__fill"
                              style={ratioStyle(barRatio(row.monthlyAmounts[index] ?? 0, monthMax))}
                            />
                          </span>
                          <Amount value={row.monthlyAmounts[index] ?? 0} tone={tone} />
                        </li>
                      ))}
                    </ul>
                    <div className="lm-category-ranking__previous">
                      <span>{translate('finance:dashboard.categories.previous', { range: comparisonRange })}</span>
                      <Amount value={row.previousAmount} tone={tone} />
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default CategoryRanking

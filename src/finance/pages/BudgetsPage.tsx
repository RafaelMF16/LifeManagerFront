import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import BudgetDonut from '../components/BudgetDonut/BudgetDonut'
import type { DonutSlice } from '../components/BudgetDonut/BudgetDonut'
import BudgetPlanEmpty from '../components/BudgetPlanEmpty/BudgetPlanEmpty'
import BudgetSliceList from '../components/BudgetSliceList/BudgetSliceList'
import type { SliceRow } from '../components/BudgetSliceList/BudgetSliceList'
import MonthNavigator from '../components/MonthNavigator/MonthNavigator'
import { useBudgetPlan } from '../hooks/useBudgetPlan'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import { assignColorSlots, freeAmount, freePercent, sliceAmount, sliceKey, sliceRatio } from '../utils/budgetPlan'
import { parseYearMonth, toYearMonth } from '../utils/yearMonth'
import './BudgetsPage.css'

/** How many `--chart-slice-N` colors there are; later expense slices share `--chart-slice-extra`. */
const SLICE_COLOR_COUNT = 6

function sliceColor(slot: number | undefined) {
  return slot !== undefined && slot >= 0 ? `var(--chart-slice-${slot + 1})` : 'var(--chart-slice-extra)'
}

/**
 * The budget of one month (`?month=yyyy-MM`, the current month by default): a total divided into slices, drawn as
 * a donut beside the list of slices. Each month has its own plan.
 */
function BudgetsPage() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const { money } = useFinanceFormat()
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get('month')
  const month = parseYearMonth(monthParam) && monthParam ? monthParam : toYearMonth(new Date())
  const plan = useBudgetPlan(month)
  const [selection, setSelection] = useState<{ month: string; key: string } | null>(null)
  const selectedKey = selection?.month === month ? selection.key : null

  // A color follows its category while slices come and go (adjusted during render, not in an effect, so the
  // first paint already has it).
  const expenseKeys = (plan.draft?.slices ?? []).filter((slice) => slice.type === 'Expense').map(sliceKey)
  const keysSignature = expenseKeys.join('|')
  const [colors, setColors] = useState({ signature: '', slots: {} as Record<string, number> })
  let colorSlots = colors.slots
  if (colors.signature !== keysSignature) {
    colorSlots = assignColorSlots(expenseKeys, colors.slots, SLICE_COLOR_COUNT)
    setColors({ signature: keysSignature, slots: colorSlots })
  }

  function changeMonth(next: string) {
    setSearchParams({ month: next }, { replace: true })
  }

  function select(key: string) {
    setSelection({ month, key })
  }

  function renderEditor() {
    const draft = plan.draft
    const data = plan.data
    if (!draft || !data) return null

    const savedActuals = new Map(data.slices.map((slice) => [sliceKey(slice), slice.actual]))

    const rows: SliceRow[] = draft.slices.map((slice) => {
      const key = sliceKey(slice)
      const actual = savedActuals.get(key) ?? null

      return {
        key,
        type: slice.type,
        name: slice.type === 'Investment' ? translate('finance:budgetPlan.investment') : (slice.categoryName ?? ''),
        percent: slice.percent,
        amount: sliceAmount(draft.total, slice.percent),
        color: slice.type === 'Investment' ? 'var(--chart-investment)' : sliceColor(colorSlots[key]),
        actual,
        ratio: actual === null ? null : sliceRatio(actual, draft.total, slice.percent),
      }
    })
    const donutSlices: DonutSlice[] = rows.map(({ key, name, percent, amount, color }) => ({ key, label: name, percent, amount, color }))
    const free = { percent: freePercent(draft.slices), amount: freeAmount(draft.total, draft.slices), actual: data.freeActual }

    return (
      <div className="lm-budget-plan">
        <section className="lm-budget-plan__overview" aria-label={translate('finance:budgetPlan.overviewLabel')}>
          <div className="lm-budget-plan__total">
            <span className="lm-budget-plan__total-label">{translate('finance:budgetPlan.total')}</span>
            <span className="lm-budget-plan__total-value lm-numeric">{draft.total === null ? '—' : money(draft.total)}</span>
          </div>
          <BudgetDonut
            slices={donutSlices}
            freePercent={free.percent}
            freeAmount={free.amount}
            selectedKey={selectedKey}
            onSelect={select}
          />
        </section>

        <section className="lm-budget-plan__slices" aria-label={translate('finance:budgetPlan.slicesLabel')}>
          <BudgetSliceList rows={rows} free={free} selectedKey={selectedKey} onSelect={select} />
        </section>
      </div>
    )
  }

  function renderContent() {
    if (plan.status === 'error') {
      return (
        <div className="lm-budgets-page__state">
          <span>{translate('finance:budgetPlan.loadError')}</span>
          <Button variant="secondary" size="sm" onClick={plan.reload}>
            {translate('finance:budgetPlan.retry')}
          </Button>
        </div>
      )
    }

    if (!plan.data) {
      return <div className="lm-budgets-page__state">{translate('finance:budgetPlan.loading')}</div>
    }

    return (
      <div className={`lm-budgets-page__content${plan.isFetching ? ' lm-budgets-page__content--fetching' : ''}`} aria-busy={plan.isFetching}>
        {plan.isStarted ? renderEditor() : <BudgetPlanEmpty />}
      </div>
    )
  }

  return (
    <div className="lm-budgets-page">
      <div className="lm-budgets-page__header">
        <MonthNavigator month={month} onChange={changeMonth} />
      </div>

      <p className="lm-budgets-page__intro">{translate('finance:budgetPlan.intro')}</p>

      {renderContent()}
    </div>
  )
}

export default BudgetsPage

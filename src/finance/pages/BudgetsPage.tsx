import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Input from '../../shared/components/Input/Input'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import BudgetDonut from '../components/BudgetDonut/BudgetDonut'
import type { DonutSlice } from '../components/BudgetDonut/BudgetDonut'
import BudgetPlanEmpty from '../components/BudgetPlanEmpty/BudgetPlanEmpty'
import BudgetSliceList from '../components/BudgetSliceList/BudgetSliceList'
import type { SliceRow } from '../components/BudgetSliceList/BudgetSliceList'
import MonthNavigator from '../components/MonthNavigator/MonthNavigator'
import UnsavedChangesBar from '../components/UnsavedChangesBar/UnsavedChangesBar'
import { useBudgetPlan } from '../hooks/useBudgetPlan'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import { usePrivacyMode } from '../hooks/usePrivacyMode'
import { assignColorSlots, freeAmount, freePercent, maxPercentFor, sliceAmount, sliceKey, sliceRatio } from '../utils/budgetPlan'
import { parseYearMonth, toYearMonth } from '../utils/yearMonth'
import { toFormAmount } from '../validation/amountSchema'
import { budgetPlanSaveErrors, budgetPlanTotalErrors } from '../validation/budgetPlanErrorMap'
import { budgetPlanSchema, readTotal } from '../validation/budgetPlanSchema'
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
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const { money } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const { show: showToast } = useToast()
  const { show: showErrorModal } = useErrorModal()
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get('month')
  const month = parseYearMonth(monthParam) && monthParam ? monthParam : toYearMonth(new Date())
  const plan = useBudgetPlan(month)
  const [selection, setSelection] = useState<{ month: string; key: string } | null>(null)
  const selectedKey = selection?.month === month ? selection.key : null
  const [isSaving, setIsSaving] = useState(false)

  // The total is typed as text. It follows the draft whenever the draft changes from outside the field (a month
  // loads, a discard, a copy): adjusted during render, like the colors below.
  const draftTotal = plan.draft?.total ?? null
  const [totalField, setTotalField] = useState({ month, text: '', touched: false, serverError: null as string | null })
  let total = totalField
  const typedTotal = readTotal(total.text)
  // Another month, a total that came from outside, or a total taken away from outside (a discard). Text that
  // isn't a valid total yet (the user is typing) matches a draft without one, so it stays.
  if (total.month !== month || (draftTotal !== null && typedTotal !== draftTotal) || (draftTotal === null && typedTotal !== null)) {
    total = { month, text: draftTotal === null ? '' : toFormAmount(draftTotal, i18n.language), touched: false, serverError: null }
    setTotalField(total)
  }
  const totalCheck = budgetPlanSchema.safeParse({ total: total.text })
  const totalError = total.serverError ?? (total.touched && !totalCheck.success ? totalCheck.error.issues[0].message : null)

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

  function changeTotal(text: string) {
    setTotalField({ month, text, touched: total.touched, serverError: null })
    plan.setTotal(readTotal(text))
  }

  function changePercent(key: string, percent: number) {
    const index = plan.draft?.slices.findIndex((slice) => sliceKey(slice) === key) ?? -1
    if (index >= 0) plan.setPercent(index, percent)
    select(key)
  }

  function discard() {
    plan.discard()
    setTotalField({ ...total, touched: false, serverError: null })
  }

  async function handleSave() {
    if (draftTotal === null) {
      setTotalField({ ...total, touched: true })
      return
    }

    setIsSaving(true)
    try {
      await plan.save()
      showToast(translate('finance:budgetPlan.toasts.saved'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      } else if (budgetPlanTotalErrors[err.code]) {
        setTotalField({ ...total, serverError: budgetPlanTotalErrors[err.code] })
      } else {
        showErrorModal(
          translate('finance:budgetPlan.errors.saveTitle'),
          translate(budgetPlanSaveErrors[err.code] ?? 'finance:budgetPlan.errors.invalid'),
        )
      }
    } finally {
      setIsSaving(false)
    }
  }

  function renderEditor() {
    const draft = plan.draft
    const data = plan.data
    if (!draft || !data) return null

    const savedActuals = new Map(data.slices.map((slice) => [sliceKey(slice), slice.actual]))

    const rows: SliceRow[] = draft.slices.map((slice, index) => {
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
        max: maxPercentFor(draft.slices, index),
      }
    })
    const donutSlices: DonutSlice[] = rows.map(({ key, name, percent, amount, color }) => ({ key, label: name, percent, amount, color }))
    const free = { percent: freePercent(draft.slices), amount: freeAmount(draft.total, draft.slices), actual: data.freeActual }

    return (
      <div className="lm-budget-plan">
        <section className="lm-budget-plan__overview" aria-label={translate('finance:budgetPlan.overviewLabel')}>
          {hidden ? (
            // Privacy mode: the field would show the value, so the total is only shown masked.
            <div className="lm-budget-plan__total">
              <span className="lm-budget-plan__total-label">{translate('finance:budgetPlan.total')}</span>
              <span className="lm-budget-plan__total-value lm-numeric">{money(draft.total ?? 0)}</span>
            </div>
          ) : (
            <Input
              label={translate('finance:budgetPlan.total')}
              prefix={translate('finance:budgetPlan.totalPrefix')}
              placeholder={translate('finance:budgetPlan.totalPlaceholder')}
              inputMode="decimal"
              autoComplete="off"
              numeric
              value={total.text}
              error={totalError ? translate(totalError) : undefined}
              onChange={(event) => changeTotal(event.target.value)}
              onBlur={() => setTotalField({ ...total, touched: true })}
            />
          )}
          <BudgetDonut
            slices={donutSlices}
            freePercent={free.percent}
            freeAmount={free.amount}
            selectedKey={selectedKey}
            onSelect={select}
          />
        </section>

        <section className="lm-budget-plan__slices" aria-label={translate('finance:budgetPlan.slicesLabel')}>
          {hidden ? <p className="lm-budget-plan__privacy">{translate('finance:budgetPlan.slider.privacyHint')}</p> : null}
          <BudgetSliceList
            rows={rows}
            free={free}
            selectedKey={selectedKey}
            onSelect={select}
            onPercentChange={changePercent}
            locked={hidden}
          />
        </section>
      </div>
    )
  }

  // A month without a plan the user just opened counts as a change too, so it can be saved or dropped.
  const hasChanges = plan.isDirty || (plan.isStarted && plan.data?.exists === false)

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
        {plan.isStarted ? (
          renderEditor()
        ) : (
          <BudgetPlanEmpty>
            <Button variant="primary" icon="plus" onClick={plan.start}>
              {translate('finance:budgetPlan.empty.create')}
            </Button>
          </BudgetPlanEmpty>
        )}
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

      {hasChanges ? (
        <UnsavedChangesBar
          blockedReason={draftTotal === null ? translate('finance:budgetPlan.unsaved.needsTotal') : null}
          isSaving={isSaving}
          onDiscard={discard}
          onSave={handleSave}
        />
      ) : null}
    </div>
  )
}

export default BudgetsPage

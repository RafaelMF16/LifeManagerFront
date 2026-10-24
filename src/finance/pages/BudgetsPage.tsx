import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker, useSearchParams } from 'react-router-dom'
import Button from '../../shared/components/Button/Button'
import Input from '../../shared/components/Input/Input'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { useToast } from '../../shared/hooks/useToast'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import AddSliceDialog from '../components/AddSliceDialog/AddSliceDialog'
import BudgetDonut from '../components/BudgetDonut/BudgetDonut'
import type { DonutSlice } from '../components/BudgetDonut/BudgetDonut'
import BudgetPlanEmpty from '../components/BudgetPlanEmpty/BudgetPlanEmpty'
import BudgetSliceList from '../components/BudgetSliceList/BudgetSliceList'
import type { SliceRow } from '../components/BudgetSliceList/BudgetSliceList'
import DeleteBudgetPlanModal from '../components/DeleteBudgetPlanModal/DeleteBudgetPlanModal'
import ExactValueDialog from '../components/ExactValueDialog/ExactValueDialog'
import LeaveBudgetDialog from '../components/LeaveBudgetDialog/LeaveBudgetDialog'
import MonthNavigator from '../components/MonthNavigator/MonthNavigator'
import UnsavedChangesBar from '../components/UnsavedChangesBar/UnsavedChangesBar'
import { useBudgetPlan } from '../hooks/useBudgetPlan'
import { useBudgetTotalField } from '../hooks/useBudgetTotalField'
import { useCategoryOptions } from '../hooks/useCategoryOptions'
import { useFinanceFormat } from '../hooks/useFinanceFormat'
import { usePrivacyMode } from '../hooks/usePrivacyMode'
import { assignColorSlots, freeAmount, freePercent, maxPercentFor, sliceAmount, sliceKey, sliceRatio } from '../utils/budgetPlan'
import type { DraftSlice } from '../utils/budgetPlan'
import { parseYearMonth, toYearMonth } from '../utils/yearMonth'
import { BUDGET_PLAN_NOT_FOUND_CODE, budgetPlanSaveErrors, budgetPlanTotalErrors } from '../validation/budgetPlanErrorMap'
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
  const { money, periodLabel } = useFinanceFormat()
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
  const [isAdding, setIsAdding] = useState(false)
  const [exactKey, setExactKey] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const categoryOptions = useCategoryOptions()

  const draftTotal = plan.draft?.total ?? null
  const totalField = useBudgetTotalField(month, draftTotal, plan.setTotal)

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

  /** "Outubro 2026" for a `yyyy-MM`. */
  function periodOf(value: string) {
    const parsed = parseYearMonth(value)
    return parsed ? periodLabel(parsed.month, parsed.year) : value
  }

  function showConnectionError() {
    showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
  }

  async function handleCopy(source: string) {
    setIsCopying(true)
    try {
      await plan.copyFromMonth(source)
      showToast(translate('finance:budgetPlan.toasts.copied', { month: periodOf(source) }))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) showConnectionError()
      else showErrorModal(translate('finance:budgetPlan.errors.copyTitle'), translate('finance:budgetPlan.empty.copyError', { month: periodOf(source) }))
    } finally {
      setIsCopying(false)
    }
  }

  async function handleDelete() {
    try {
      await plan.deletePlan()
      showToast(translate('finance:budgetPlan.toasts.deleted'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) showConnectionError()
      // Already gone (deleted on another device): the reload shows the month as it is.
      else if (err.code === BUDGET_PLAN_NOT_FOUND_CODE) plan.reload()
      else showErrorModal(translate('finance:budgetPlan.delete.errorTitle'), translate('common:errors.generic'))
    }
    setIsDeleting(false)
  }

  function changeMonth(next: string) {
    setSearchParams({ month: next }, { replace: true })
  }

  function select(key: string) {
    setSelection({ month, key })
  }

  function indexOf(key: string) {
    return plan.draft?.slices.findIndex((slice) => sliceKey(slice) === key) ?? -1
  }

  function changePercent(key: string, percent: number) {
    const index = indexOf(key)
    if (index >= 0) plan.setPercent(index, percent)
    select(key)
  }

  function removeSlice(key: string) {
    const index = indexOf(key)
    if (index >= 0) plan.removeSlice(index)
  }

  function addSlice(slice: DraftSlice) {
    plan.addSlice(slice)
    select(sliceKey(slice))
  }

  function discard() {
    plan.discard()
    totalField.reset()
  }

  async function handleSave() {
    if (draftTotal === null) {
      totalField.touch()
      return
    }

    setIsSaving(true)
    try {
      await plan.save()
      showToast(translate('finance:budgetPlan.toasts.saved'))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showConnectionError()
      } else if (budgetPlanTotalErrors[err.code]) {
        totalField.showServerError(budgetPlanTotalErrors[err.code])
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
    const exactRow = exactKey ? rows.find((row) => row.key === exactKey) : undefined
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
              value={totalField.text}
              error={totalField.error ? translate(totalField.error) : undefined}
              onChange={(event) => totalField.change(event.target.value)}
              onBlur={totalField.touch}
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
            key={month}
            rows={rows}
            free={free}
            selectedKey={selectedKey}
            onSelect={select}
            onPercentChange={changePercent}
            onExactValue={setExactKey}
            onRemove={removeSlice}
            locked={hidden}
          />
          {hidden ? null : (
            <div className="lm-budget-plan__add">
              <Button variant="secondary" icon="plus" onClick={() => setIsAdding(true)}>
                {translate('finance:budgetPlan.add.button')}
              </Button>
            </div>
          )}
        </section>

        {isAdding ? (
          <AddSliceDialog
            categories={categoryOptions.categories}
            categoriesStatus={categoryOptions.status}
            slices={draft.slices}
            onAdd={addSlice}
            onClose={() => setIsAdding(false)}
          />
        ) : null}

        {exactRow ? (
          <ExactValueDialog
            name={exactRow.name}
            percent={exactRow.percent}
            max={exactRow.max}
            total={draft.total}
            onApply={(percent) => changePercent(exactRow.key, percent)}
            onClose={() => setExactKey(null)}
          />
        ) : null}
      </div>
    )
  }

  // A month without a plan the user just opened counts as a change too, so it can be saved or dropped.
  const hasChanges = plan.isDirty || (plan.isStarted && plan.data?.exists === false)

  // Any navigation away with changes asks first: another screen, and another month too (it changes `?month=`).
  // Except to the sign-in screen: logout and an expired session get there with the session already gone, so the
  // changes couldn't be saved anyway. Closing or reloading the tab can only get the browser's own prompt.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges &&
      nextLocation.pathname !== '/auth' &&
      (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search),
  )

  useEffect(() => {
    if (!hasChanges) return

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasChanges])

  function leaveWithoutSaving() {
    plan.discard()
    blocker.proceed?.()
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
        {plan.isStarted ? (
          renderEditor()
        ) : (
          <BudgetPlanEmpty>
            {plan.data.copySource ? (
              <Button variant="primary" icon="copy" loading={isCopying} onClick={() => void handleCopy(plan.data!.copySource!)}>
                {translate('finance:budgetPlan.empty.copy', { month: periodOf(plan.data.copySource) })}
              </Button>
            ) : null}
            <Button variant={plan.data.copySource ? 'secondary' : 'primary'} icon="plus" onClick={plan.start}>
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
        {plan.data?.exists && plan.data.month === month ? (
          <Button variant="ghost" icon="trash-2" onClick={() => setIsDeleting(true)}>
            {translate('finance:budgetPlan.delete.button')}
          </Button>
        ) : null}
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

      {blocker.state === 'blocked' ? (
        <LeaveBudgetDialog period={periodOf(month)} onStay={() => blocker.reset?.()} onLeave={leaveWithoutSaving} />
      ) : null}

      {isDeleting ? (
        <DeleteBudgetPlanModal period={periodOf(month)} onClose={() => setIsDeleting(false)} onConfirm={handleDelete} />
      ) : null}
    </div>
  )
}

export default BudgetsPage

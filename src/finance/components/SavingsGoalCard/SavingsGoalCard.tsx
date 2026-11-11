import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import { usePrivacyMode } from '../../../shared/hooks/usePrivacyMode'
import { useFinanceFormat } from '../../hooks/useFinanceFormat'
import type { SavingsGoalResponseDto } from '../../types/SavingsGoalDtos'
import { deadlineCountdown, monthlyNeededText, paceBadge, progressBarRatio, savingsGoalIcon } from '../../utils/savingsGoal'
import { parseYearMonth } from '../../utils/yearMonth'
import './SavingsGoalCard.css'

/** Hidden bars all get this length: their real lengths would give the progress away. */
const HIDDEN_BAR_RATIO = 0.5

interface SavingsGoalCardProps {
  goal: SavingsGoalResponseDto
  /** The goal's name, as a link to its details in the list; plain text on the details page. */
  title: ReactNode
  /** `large` is the details page's card. */
  size?: 'default' | 'large'
  /** Edit/archive/restore buttons, at the card's top right. */
  actions?: ReactNode
}

/**
 * One savings goal: icon and name, the progress bar with "R$ X de R$ Y (N%)", the deadline, how much to save per
 * month and the pace badge (a word next to its color). Privacy mode masks the amounts, gives every bar the same
 * neutral length and hides "Guarde R$ X/mês", which would tell the amount left.
 */
function SavingsGoalCard({ goal, title, size = 'default', actions }: SavingsGoalCardProps) {
  const { t: translate } = useTranslation('finance')
  const { money, percent, shortMonthName, dayLabel } = useFinanceFormat()
  const { hidden } = usePrivacyMode()
  const archived = goal.archivedAt !== null
  const badge = archived ? null : paceBadge(goal.pace)
  const countdown = deadlineCountdown(goal)
  const needed = hidden || archived ? null : monthlyNeededText(goal)
  const deadline = parseYearMonth(goal.targetMonth)
  const ratioText = percent(goal.ratio)

  const barStyle = { '--lm-bar': hidden ? HIDDEN_BAR_RATIO : progressBarRatio(goal.ratio) } as CSSProperties
  const classes = [
    'lm-goal-card',
    `lm-goal-card--${size}`,
    `lm-goal-card--${archived ? 'archived' : goal.pace}`,
    hidden && 'lm-goal-card--hidden',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes} data-tour="savings.card">
      <div className="lm-goal-card__header">
        <span className="lm-goal-card__icon" aria-hidden="true">
          <Icon name={savingsGoalIcon(goal.icon)} size={size === 'large' ? 22 : 18} />
        </span>
        <div className="lm-goal-card__title">{title}</div>
        {actions ? <div className="lm-goal-card__actions">{actions}</div> : null}
      </div>

      <div className="lm-goal-card__progress">
        <span className="lm-goal-card__figures lm-numeric">
          {translate('finance:savingsGoals.card.progress', {
            saved: money(goal.saved),
            target: money(goal.targetAmount),
            percent: ratioText,
          })}
        </span>
        <span
          className="lm-goal-card__track"
          role="img"
          aria-label={translate('finance:savingsGoals.card.progressLabel', { percent: ratioText })}
        >
          <span className="lm-goal-card__fill" style={barStyle} />
        </span>
      </div>

      <div className="lm-goal-card__footer">
        <span className="lm-goal-card__deadline">
          {deadline
            ? translate('finance:savingsGoals.deadline.until', { month: `${shortMonthName(deadline.month)} ${deadline.year}` })
            : translate('finance:savingsGoals.deadline.none')}
          {countdown ? ` · ${translate(countdown.key, countdown.values)}` : null}
        </span>
        {needed ? (
          <span className="lm-goal-card__needed lm-numeric">{translate(needed.key, { amount: money(needed.amount) })}</span>
        ) : null}
        {goal.pace === 'Done' && goal.completedAt && !archived ? (
          <span className="lm-goal-card__completed">
            {translate('finance:savingsGoals.card.completedOn', { date: dayLabel(goal.completedAt) })}
          </span>
        ) : null}
        {archived ? (
          <span className="lm-goal-card__badge lm-goal-card__badge--archived">{translate('finance:savingsGoals.card.archived')}</span>
        ) : badge ? (
          <span className={`lm-goal-card__badge lm-goal-card__badge--${badge.tone}`}>
            <span className="lm-goal-card__dot" aria-hidden="true" />
            {translate(badge.labelKey)}
          </span>
        ) : null}
      </div>
    </article>
  )
}

export default SavingsGoalCard

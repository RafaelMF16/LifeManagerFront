import { useTranslation } from 'react-i18next'
import type { RankingEntryDto, RankingPreviousDto, RankingReactionKind } from '../../types/RankingDtos'
import { formatWeekRange, weekEndOf } from '../../utils/ranking'
import RankingBoard from '../RankingBoard/RankingBoard'
import './RankingPreviousCard.css'

interface RankingPreviousCardProps {
  previous: RankingPreviousDto
  pendingMemberIds: ReadonlySet<number>
  onReact: (entry: RankingEntryDto, kind: RankingReactionKind | null) => void
}

/** Last week's podium and my final place, shown all week long next to the current ranking. */
function RankingPreviousCard({ previous, pendingMemberIds, onReact }: RankingPreviousCardProps) {
  const { t: translate, i18n } = useTranslation('habits')
  const range = formatWeekRange(previous.weekStart, weekEndOf(previous.weekStart), i18n.language)

  return (
    <section className="lm-ranking-previous" aria-labelledby="lm-ranking-previous-title" data-tour="ranking.previous">
      <div className="lm-ranking-previous__heading">
        <h2 id="lm-ranking-previous-title" className="lm-ranking-previous__title">
          {translate('habits:ranking.previous.title')}
        </h2>
        <span className="lm-ranking-previous__range">
          {range}
          {previous.status !== 'Final' ? ` · ${translate('habits:ranking.previous.provisional')}` : ''}
        </span>
      </div>

      {previous.myPosition !== null ? (
        <p className="lm-ranking-previous__mine">
          {translate('habits:ranking.previous.mine', { position: previous.myPosition, count: previous.myPoints ?? 0 })}
        </p>
      ) : null}

      {previous.podium.length > 0 ? (
        <RankingBoard entries={previous.podium} canReact pendingMemberIds={pendingMemberIds} onReact={onReact} compact />
      ) : null}
    </section>
  )
}

export default RankingPreviousCard

import { useTranslation } from 'react-i18next'
import type { RankingReactionKind, RankingReactionsDto } from '../../types/RankingDtos'

interface ReactionButtonsProps {
  reactions: RankingReactionsDto
  /** The member's name, for the accessible labels ("Clap for Ana"). */
  name: string
  disabled?: boolean
  /** The reaction to keep (`null` = undo mine). */
  onReact: (kind: RankingReactionKind | null) => void
}

const KINDS: { kind: RankingReactionKind; emoji: string; count: (reactions: RankingReactionsDto) => number }[] = [
  { kind: 'Clap', emoji: '👏', count: (reactions) => reactions.clap },
  { kind: 'Fire', emoji: '🔥', count: (reactions) => reactions.fire },
]

/** 👏 and 🔥 with their counts. Tapping mine again undoes it; tapping the other one switches. */
function ReactionButtons({ reactions, name, disabled, onReact }: ReactionButtonsProps) {
  const { t: translate } = useTranslation('habits')

  return (
    <span className="lm-ranking-reactions">
      {KINDS.map(({ kind, emoji, count }) => {
        const mine = reactions.mine === kind
        return (
          <button
            key={kind}
            type="button"
            className={`lm-ranking-reactions__button${mine ? ' lm-ranking-reactions__button--mine' : ''}`}
            aria-pressed={mine}
            aria-label={translate(`habits:ranking.reactions.${kind}`, { name, count: count(reactions) })}
            disabled={disabled}
            onClick={() => onReact(mine ? null : kind)}
          >
            <span aria-hidden="true">{emoji}</span>
            <span className="lm-ranking-reactions__count" aria-hidden="true">
              {count(reactions)}
            </span>
          </button>
        )
      })}
    </span>
  )
}

export default ReactionButtons

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RankingEntryDto, RankingReactionKind } from '../../types/RankingDtos'
import { achievementTitle } from '../../utils/achievements'
import { medal, reactionCount } from '../../utils/ranking'
import PlayerAvatar from '../PlayerAvatar/PlayerAvatar'
import ReactionButtons from './ReactionButtons'
import './RankingBoard.css'

interface RankingBoardProps {
  entries: RankingEntryDto[]
  /** Reactions are open on this week (the current one and the one before). */
  canReact: boolean
  /** Members whose reaction is being saved: their buttons wait. */
  pendingMemberIds: ReadonlySet<number>
  onReact: (entry: RankingEntryDto, kind: RankingReactionKind | null) => void
  /** A smaller list, for the podium card. */
  compact?: boolean
}

/** The week's lines, best first: place, player, points and perfect days; my line highlighted, with who reacted to me. */
function RankingBoard({ entries, canReact, pendingMemberIds, onReact, compact }: RankingBoardProps) {
  const { t: translate } = useTranslation('habits')
  const [showReactedBy, setShowReactedBy] = useState(false)

  return (
    <ol className={`lm-ranking-board${compact ? ' lm-ranking-board--compact' : ''}`}>
      {entries.map((entry, index) => {
        const medalIcon = medal(entry.position)
        const received = reactionCount(entry.reactions)

        return (
          <li
            key={entry.memberId ?? `left-${index}`}
            className={`lm-ranking-board__row${entry.isMe ? ' lm-ranking-board__row--me' : ''}`}
            aria-current={entry.isMe ? 'true' : undefined}
            data-tour={entry.isMe ? 'ranking.me' : undefined}
          >
            <span className="lm-ranking-board__position" aria-label={translate('habits:ranking.board.position', { position: entry.position })}>
              {medalIcon ?? entry.position}
            </span>
            <PlayerAvatar avatar={entry.avatar} size="sm" />
            <span className="lm-ranking-board__who">
              <span className="lm-ranking-board__name">
                {entry.name}
                {entry.isMe ? <span className="lm-ranking-board__tag">{translate('habits:ranking.board.you')}</span> : null}
                {entry.leftGroup ? <span className="lm-ranking-board__tag">{translate('habits:ranking.board.left')}</span> : null}
                {!entry.eligible && !entry.leftGroup ? (
                  <span className="lm-ranking-board__tag lm-ranking-board__tag--muted" title={translate('habits:ranking.board.lateHint')}>
                    {translate('habits:ranking.board.late')}
                  </span>
                ) : null}
              </span>
              {entry.title && !compact ? <span className="lm-ranking-board__title">{achievementTitle(entry.title, translate)}</span> : null}
            </span>
            <span className="lm-ranking-board__score">
              <strong>{translate('habits:ranking.board.points', { count: entry.points })}</strong>
              {compact ? null : (
                <span className="lm-ranking-board__perfect">
                  {translate('habits:ranking.board.perfectDays', { count: entry.perfectDays })}
                </span>
              )}
            </span>
            <span className="lm-ranking-board__reactions">
              {entry.isMe ? (
                received > 0 && entry.reactedBy ? (
                  <button
                    type="button"
                    className="lm-ranking-board__received"
                    aria-expanded={showReactedBy}
                    onClick={() => setShowReactedBy((shown) => !shown)}
                  >
                    {translate('habits:ranking.reactions.received', { count: received })}
                  </button>
                ) : null
              ) : entry.memberId !== null && canReact ? (
                <ReactionButtons
                  reactions={entry.reactions}
                  name={entry.name}
                  disabled={pendingMemberIds.has(entry.memberId)}
                  onReact={(kind) => onReact(entry, kind)}
                />
              ) : received > 0 ? (
                <span className="lm-ranking-board__received-static">
                  {entry.reactions.clap > 0 ? `👏 ${entry.reactions.clap}` : null} {entry.reactions.fire > 0 ? `🔥 ${entry.reactions.fire}` : null}
                </span>
              ) : null}
            </span>
            {entry.isMe && showReactedBy && entry.reactedBy ? (
              <ul className="lm-ranking-board__reacted-by">
                {entry.reactedBy.map((reaction) => (
                  <li key={reaction.memberId}>
                    <span aria-hidden="true">{reaction.kind === 'Clap' ? '👏' : '🔥'}</span>{' '}
                    {translate(`habits:ranking.reactions.from${reaction.kind}`, { name: reaction.name })}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export default RankingBoard

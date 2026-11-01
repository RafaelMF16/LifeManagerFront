import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import IconButton from '../../../shared/components/IconButton/IconButton'
import type { RankingGroupDetailsDto, RankingGroupMemberDto } from '../../types/RankingDtos'
import { achievementTitle } from '../../utils/achievements'
import PlayerAvatar from '../PlayerAvatar/PlayerAvatar'
import './RankingMembers.css'

interface RankingMembersProps {
  group: RankingGroupDetailsDto
  onCopyLink: () => void
  onCopyCode: () => void
  /** Owner only. */
  onRegenerate: () => void
  /** Owner only, never for themselves. */
  onRemove: (member: RankingGroupMemberDto) => void
  onLeave: () => void
}

/** The invite (code and link to share) and the members, oldest first, with the owner's actions and "leave". */
function RankingMembers({ group, onCopyLink, onCopyCode, onRegenerate, onRemove, onLeave }: RankingMembersProps) {
  const { t: translate } = useTranslation('habits')

  return (
    <section className="lm-ranking-members" aria-labelledby="lm-ranking-members-title">
      <div className="lm-ranking-members__heading">
        <h2 id="lm-ranking-members-title" className="lm-ranking-members__title">
          {translate('habits:ranking.members.title')}
        </h2>
        <span className="lm-ranking-members__count">{translate('habits:ranking.members.count', { count: group.members.length })}</span>
      </div>

      <div className="lm-ranking-members__invite" data-tour="ranking.invite">
        <span className="lm-ranking-members__invite-label">{translate('habits:ranking.invite.label')}</span>
        <span className="lm-ranking-members__code">
          <code>{group.inviteCode}</code>
          <IconButton icon="copy" size="sm" label={translate('habits:ranking.invite.copyCode')} onClick={onCopyCode} />
        </span>
        <span className="lm-ranking-members__invite-actions">
          <Button variant="primary" size="sm" icon="link" onClick={onCopyLink}>
            {translate('habits:ranking.invite.copyLink')}
          </Button>
          {group.isOwner ? (
            <Button variant="ghost" size="sm" icon="refresh-cw" onClick={onRegenerate}>
              {translate('habits:ranking.invite.regenerate')}
            </Button>
          ) : null}
        </span>
        <span className="lm-ranking-members__invite-hint">{translate('habits:ranking.invite.hint')}</span>
      </div>

      <ul className="lm-ranking-members__list">
        {group.members.map((member) => (
          <li key={member.memberId} className="lm-ranking-members__member">
            <PlayerAvatar avatar={member.avatar} size="sm" />
            <span className="lm-ranking-members__who">
              <span className="lm-ranking-members__name">
                {member.name}
                {member.isMe ? <span className="lm-ranking-members__tag">{translate('habits:ranking.board.you')}</span> : null}
                {member.isOwner ? (
                  <span className="lm-ranking-members__tag lm-ranking-members__tag--owner">{translate('habits:ranking.members.owner')}</span>
                ) : null}
              </span>
              {member.title ? <span className="lm-ranking-members__title-line">{achievementTitle(member.title, translate)}</span> : null}
            </span>
            {group.isOwner && !member.isMe ? (
              <IconButton
                icon="user-minus"
                size="sm"
                variant="ghost"
                label={translate('habits:ranking.members.removeAria', { name: member.name })}
                onClick={() => onRemove(member)}
              />
            ) : null}
          </li>
        ))}
      </ul>

      <div className="lm-ranking-members__footer">
        <Button variant="secondary" size="sm" icon="log-out" onClick={onLeave}>
          {translate('habits:ranking.leave.button')}
        </Button>
      </div>
    </section>
  )
}

export default RankingMembers

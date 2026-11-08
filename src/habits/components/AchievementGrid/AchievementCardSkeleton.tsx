import Skeleton from '../../../shared/components/Skeleton/Skeleton'

/** One achievement card while the achievements load, in the real card classes (medal, tier and name, progress). */
function AchievementCardSkeleton({ index }: { index: number }) {
  return (
    <div className="lm-achievement-card">
      <div className="lm-achievement-card__top">
        <Skeleton shape="circle" width={40} />
        <div className="lm-achievement-card__info">
          <Skeleton width={48} />
          <Skeleton width={index % 2 === 0 ? '70%' : '55%'} />
          <Skeleton width="85%" />
        </div>
      </div>
      <Skeleton shape="block" height={6} />
    </div>
  )
}

export default AchievementCardSkeleton

import { useTitan } from '../../state/titan-context'

type AchievementCardProps = {
  achievement: {
    id: string
    title: string
    description: string
    icon: string
    level: string
    points: number
    unlocked?: boolean
  }
  onUnlock?: () => void
}

export function AchievementCard({ achievement, onUnlock }: AchievementCardProps) {
  const { user } = useTitan()
  const hasUnlocked = achievement.unlocked || user?.role === 'owner'

  if (!hasUnlocked) {
    return null
  }

  return (
    <div className={`achievement-card achievement-${achievement.level}`}>
      <div className="achievement-icon">
        <span className="icon" aria-hidden="true">
          {achievement.icon}
        </span>
      </div>
      <div className="achievement-content">
        <h4 className="achievement-title">{achievement.title}</h4>
        <p className="achievement-description">{achievement.description}</p>
        <div className="achievement-points">
          <span className="points">{achievement.points} pts</span>
          <span className="xp-bar">
            <span className="xp-fill" style={{ width: '100%' }} />
          </span>
        </div>
        {achievement.unlocked ? (
          <button className="unlock-btn" onClick={onUnlock} type="button">
            Unlocked
          </button>
        ) : null}
      </div>
    </div>
  )
}

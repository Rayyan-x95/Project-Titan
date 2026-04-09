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
  const canViewAchievement = achievement.unlocked || user?.role === 'owner'
  const isUnlocked = Boolean(achievement.unlocked)

  if (!canViewAchievement) {
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
            <span className="xp-fill xp-fill-full" />
          </span>
        </div>
        <button
          className="unlock-btn"
          disabled={!isUnlocked}
          onClick={isUnlocked ? onUnlock : undefined}
          type="button"
        >
          {isUnlocked ? 'Unlocked' : 'Locked preview'}
        </button>
      </div>
    </div>
  )
}

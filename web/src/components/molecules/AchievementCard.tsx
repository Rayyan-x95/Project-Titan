import { useState, useEffect } from 'react'
import { useTitan } from '../../state/titan-context'
import { formatBytes } from '../../lib/utils'

interface AchievementCardProps {
  achievement: {
    id: string
    title: string
    description: string
    icon: string
    level: string
    points: number
  }
  onUnlock?: () => void
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onUnlock }) => {
  const { user } = useTitan()
  const [hasUnlocked, setHasUnlocked] = useState(false)
  const [hasUnlockedAll, setHasUnlockedAll] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin' || achievement.unlocked) {
      setHasUnlocked(true)
    }
  }, [user?.role, achievement.unlocked])

  useEffect(() => {
    if (hasUnlockedAll) {
      setHasUnlocked(true)
      setHasUnlockedAll(false)
    }
  }, [hasUnlockedAll])

  const iconColor = achievement.level === 'expert' ? '#f1c40f' : '#3498db'

  if (!hasUnlocked) return null

  return (
    <div className={`achievement-card ${hasUnlockedAll ? 'unlocked-all' : ''}`}>
      <div className="achievement-icon">
        <span className="icon">{achievement.icon}</span>
      </div>
      <div className="achievement-content">
        <h4 className="achievement-title">{achievement.title}</h4>
        <p className="achievement-description">{achievement.description}</p>
        <div className="achievement-points">
          <span className="points">🎯 {achievement.points}</span>
          <span className="xp-bar">
            <div className="xp-fill" style={{ width: '100%' }}></div>
          </span>
        </div>
        {achievement.unlocked && !hasUnlockedAll && (
          <button className="unlock-btn" onClick={onUnlock}>
            Unlocked
          </button>
        )}
      </div>
    </div>
  )
}

export { AchievementCard }

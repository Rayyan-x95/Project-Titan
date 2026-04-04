import React from 'react'
import { Link } from 'react-router-dom'
import { useTitan } from '../../state/titan-context'
import { formatBytes } from '../../lib/utils'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    avatar?: string
    completed: boolean
  }
  onEdit?: () => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  const { user } = useTitan()

  const isCompleted = !project.completed
  const isMine = user?.role === 'student' && project.projectType === 'my-projects'

  return (
    <article
      className={`project-card ${isMine ? 'mine' : ''} ${isCompleted ? 'completed' : ''}`}
    >
      <div className="card-image">
        {project.avatar || (
          <div className="avatar-placeholder">
            <div className="avatar">📁</div>
          </div>
        )}
        {project.avatar && (
          <img
            src={project.avatar}
            alt={project.name}
            className="project-avatar"
          />
        )}
        <div className="project-overlay">
          {isMine && (
            <div className="my-badge">MY</div>
          )}
          {!isMine && isCompleted && (
            <div className="completed-badge">✓</div>
          )}
        </div>
      </div>

      <div className="card-details">
        <h3 className="card-name">{project.name}</h3>
        <p className="card-description">{project.description}</p>

        {isMine && (
          <div className="card-actions">
            <button
              className="btn btn-small"
              onClick={onEdit}
            >
              Edit
            </button>
            {!isMine && (
              <button
                className="btn btn-small btn-ghost"
                onClick={onEdit}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      <div className="card-meta">
        <span className={`status ${isMine ? 'mine' : ''}`}>
          {isMine ? 'My Projects' : isCompleted ? 'Completed' : 'In Progress'}
        </span>
        {isMine && (
          <span className="user-info">
            {user?.name}
          </span>
        )}
      </div>
    </article>
  )
}

export { ProjectCard }

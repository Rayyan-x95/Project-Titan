import { useTitan } from '../../state/titan-context'

type ProjectCardProps = {
  project: {
    id: string
    name: string
    description: string
    avatar?: string
    completed: boolean
    owner?: string
  }
  onEdit?: () => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { user } = useTitan()
  const isMine = Boolean(user?.name && project.owner && user.name === project.owner)

  return (
    <article className={`project-card ${isMine ? 'mine' : ''} ${project.completed ? 'completed' : ''}`}>
      <div className="card-image">
        {project.avatar ? (
          <img alt={project.name} className="project-avatar" src={project.avatar} />
        ) : (
          <div className="avatar-placeholder">
            <div className="avatar">Project</div>
          </div>
        )}
      </div>

      <div className="card-details">
        <h3 className="card-name">{project.name}</h3>
        <p className="card-description">{project.description}</p>

        {onEdit ? (
          <div className="card-actions">
            <button className="btn btn-small" onClick={onEdit} type="button">
              Edit
            </button>
          </div>
        ) : null}
      </div>

      <div className="card-meta">
        <span className={`status ${isMine ? 'mine' : ''}`}>
          {isMine ? 'Mine' : project.completed ? 'Completed' : 'In Progress'}
        </span>
        {project.owner ? <span className="user-info">{project.owner}</span> : null}
      </div>
    </article>
  )
}

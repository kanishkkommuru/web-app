import { Trash2, Edit2, CheckCircle, Circle, Calendar, Flag } from 'lucide-react';
import './TaskCard.css';

const priorityColors = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const statusColors = { todo: 'badge-todo', in_progress: 'badge-in_progress', completed: 'badge-completed' };

export default function TaskCard({ task, onDelete, onEdit, onToggle }) {
  const isComplete = task.status === 'completed';
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !isComplete;

  return (
    <div className={`task-card card ${isComplete ? 'task-done' : ''}`}>
      <div className="task-card-top">
        <button className="toggle-btn" onClick={() => onToggle(task)} title="Toggle complete">
          {isComplete ? <CheckCircle size={20} className="checked" /> : <Circle size={20} />}
        </button>
        <div className="task-badges">
          <span className={`badge ${priorityColors[task.priority] || ''}`}>
            <Flag size={10} /> {task.priority}
          </span>
          <span className={`badge ${statusColors[task.status] || ''}`}>
            {task.status === 'in_progress' ? 'In Progress' : task.status}
          </span>
        </div>
      </div>

      <h3 className={`task-title ${isComplete ? 'strikethrough' : ''}`}>{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}

      {dueDate && (
        <div className={`task-due ${isOverdue ? 'overdue' : ''}`}>
          <Calendar size={13} />
          <span>{isOverdue ? 'Overdue · ' : ''}{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )}

      <div className="task-card-actions">
        <button className="action-btn edit" onClick={onEdit} title="Edit">
          <Edit2 size={15} />
        </button>
        <button className="action-btn delete" onClick={() => onDelete(task._id)} title="Delete">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

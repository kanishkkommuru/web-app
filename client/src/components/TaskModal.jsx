import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import './TaskModal.css';

const defaultForm = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [task]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || undefined };
      let data;
      if (task) {
        ({ data } = await api.patch(`/api/tasks/${task._id}`, payload));
      } else {
        ({ data } = await api.post('/api/tasks', payload));
      }
      onSave(data.task || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in">
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button id="modal-close" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="form-group">
            <label>Title *</label>
            <input id="task-title" name="title" value={form.title} onChange={handle} placeholder="What needs to be done?" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea id="task-desc" name="description" value={form.description} onChange={handle} placeholder="Add details..." rows={3} />
          </div>

          <div className="modal-row">
            <div className="form-group">
              <label>Priority</label>
              <select id="task-priority" name="priority" value={form.priority} onChange={handle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select id="task-status" name="status" value={form.status} onChange={handle}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input id="task-due" type="date" name="dueDate" value={form.dueDate} onChange={handle} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="task-save" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"></span> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

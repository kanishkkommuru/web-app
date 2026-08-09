import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, BarChart2, Zap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import StatsChart from '../components/StatsChart';
import toast from 'react-hot-toast';
import './Dashboard.css';

const FILTERS = ['all', 'todo', 'in_progress', 'completed'];
const PRIORITIES = ['all', 'high', 'medium', 'low'];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data.tasks || data || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(t => t.filter(x => x._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      const { data } = await api.patch(`/api/tasks/${task._id}`, { status: newStatus });
      setTasks(t => t.map(x => x._id === task._id ? (data.task || data) : x));
    } catch { toast.error('Failed to update task'); }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || t.status === filter;
    const matchPriority = priority === 'all' || t.priority === priority;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        {/* Header */}
        <div className="dash-header fade-in">
          <div>
            <h1 className="dash-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="dash-subtitle">Here&apos;s what&apos;s on your plate today</p>
          </div>
          <div className="dash-header-actions">
            <button id="chart-toggle" className="btn btn-ghost" onClick={() => setShowChart(v => !v)}>
              <BarChart2 size={16} /> {showChart ? 'Hide' : 'Analytics'}
            </button>
            <button id="new-task-btn" className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          <StatCard icon={<Zap size={20} />} label="Total" value={stats.total} color="accent" />
          <StatCard icon={<Clock size={20} />} label="To Do" value={stats.todo} color="info" />
          <StatCard icon={<AlertCircle size={20} />} label="In Progress" value={stats.inProgress} color="warning" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={stats.completed} color="success" />
        </div>

        {/* Chart */}
        {showChart && <StatsChart tasks={tasks} />}

        {/* Filters */}
        <div className="filters-bar fade-in">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-pills">
            {FILTERS.map(f => (
              <button key={f} id={`filter-${f}`} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="filter-pills">
            {PRIORITIES.map(p => (
              <button key={p} id={`priority-${p}`} className={`pill priority ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="task-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon"><CheckCircle2 size={48} /></div>
            <h3>No tasks found</h3>
            <p>{search ? 'Try adjusting your search or filters' : 'Create your first task to get started!'}</p>
            {!search && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>
        ) : (
          <div className="task-grid">
            {filtered.map((task, i) => (
              <div key={task._id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <TaskCard
                  task={task}
                  onDelete={deleteTask}
                  onEdit={() => { setEditTask(task); setShowModal(true); }}
                  onToggle={toggleComplete}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => setShowModal(false)}
          onSave={(saved) => {
            if (editTask) {
              setTasks(t => t.map(x => x._id === saved._id ? saved : x));
            } else {
              setTasks(t => [saved, ...t]);
            }
            setShowModal(false);
            toast.success(editTask ? 'Task updated!' : 'Task created!');
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

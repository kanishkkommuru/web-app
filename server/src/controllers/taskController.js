const Task = require('../models/Task');

const mapStatusToModel = (status) => {
  if (status === 'in_progress') return 'in-progress';
  if (status === 'completed') return 'done';
  return status;
};

const mapStatusToClient = (status) => {
  if (status === 'in-progress') return 'in_progress';
  if (status === 'done') return 'completed';
  return status;
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Map status for frontend compatibility
    const mappedTasks = tasks.map(task => {
      const t = task.toObject();
      t.status = mapStatusToClient(t.status);
      return t;
    });
    
    res.status(200).json(mappedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const taskData = { ...req.body, user: req.user._id };
    if (taskData.status) taskData.status = mapStatusToModel(taskData.status);
    
    const task = await Task.create(taskData);
    
    const t = task.toObject();
    t.status = mapStatusToClient(t.status);
    
    res.status(201).json(t);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskData = { ...req.body };
    if (taskData.status) taskData.status = mapStatusToModel(taskData.status);
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      taskData,
      { new: true, runValidators: true }
    );
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const t = task.toObject();
    t.status = mapStatusToClient(t.status);
    
    res.status(200).json(t);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

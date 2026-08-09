const mongoose = require('mongoose');

/**
 * Task Schema
 * Core entity for the task management system
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'review', 'done'],
        message: '{VALUE} is not a valid status',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query optimization
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ title: 'text', description: 'text' });

// Auto-set completedAt when status changes to done
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'done') {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'done') {
    this.completedAt = undefined;
  }
  next();
});

// Virtual: check if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'done') {
    return false;
  }
  return new Date() > this.dueDate;
});

module.exports = mongoose.model('Task', taskSchema);

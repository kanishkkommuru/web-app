const mongoose = require('mongoose');

/**
 * Category Schema
 * Organizes tasks into categorized groups
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'],
    },
    icon: {
      type: String,
      default: '📁',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Category must belong to a user'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique category name per user
categorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);

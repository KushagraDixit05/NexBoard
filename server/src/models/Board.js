const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    maxlength: [100, 'Board name cannot exceed 100 characters'],
  },
  description: { type: String, maxlength: 500 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

boardSchema.index({ project: 1 });

module.exports = mongoose.model('Board', boardSchema);

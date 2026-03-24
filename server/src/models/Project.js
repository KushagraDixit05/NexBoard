const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  description: { type: String, maxlength: 1000 },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['manager', 'member'], default: 'member' },
  }],
  isArchived: { type: Boolean, default: false },
  color:      { type: String, default: '#3b82f6' },
}, { timestamps: true });

projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);

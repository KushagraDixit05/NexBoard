const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename:     { type: String, required: true }, // Stored filename (unique)
  originalName: { type: String, required: true }, // Original upload name
  mimeType:     { type: String },
  size:         { type: Number }, // bytes
  path:         { type: String, required: true }, // filesystem path
}, { timestamps: true });

attachmentSchema.index({ task: 1 });

module.exports = mongoose.model('Attachment', attachmentSchema);

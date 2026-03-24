const mongoose = require('mongoose');

const swimlaneSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Swimlane name is required'],
    trim: true,
    maxlength: [100, 'Swimlane name cannot exceed 100 characters'],
  },
  position: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

swimlaneSchema.index({ board: 1, position: 1 });

module.exports = mongoose.model('Swimlane', swimlaneSchema);

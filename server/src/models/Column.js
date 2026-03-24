const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Column title is required'],
    trim: true,
    maxlength: [100, 'Column title cannot exceed 100 characters'],
  },
  position:  { type: Number, required: true, default: 0 },
  taskLimit: { type: Number, default: 0 }, // 0 = no limit (WIP limit)
  color:     { type: String, default: '#e5e7eb' },
}, { timestamps: true });

columnSchema.index({ board: 1, position: 1 });

module.exports = mongoose.model('Column', columnSchema);

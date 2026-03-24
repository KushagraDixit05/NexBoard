const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name:     { type: String, required: true, trim: true },
  type:     { type: String, enum: ['text', 'number', 'date', 'boolean', 'dropdown'], required: true },
  options:  [{ type: String }], // For dropdown type
  required: { type: Boolean, default: false },
  position: { type: Number, default: 0 },
}, { timestamps: true });

customFieldSchema.index({ project: 1 });

module.exports = mongoose.model('CustomField', customFieldSchema);

const path = require('path');
const fs = require('fs');
const Attachment = require('../models/Attachment');
const { UPLOAD_DIR } = require('../config/env');

// POST /api/attachments (multipart/form-data)
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { task } = req.body;
    const attachment = await Attachment.create({
      task,
      user:         req.user._id,
      filename:     req.file.filename,
      originalName: req.file.originalname,
      mimeType:     req.file.mimetype,
      size:         req.file.size,
      path:         req.file.path,
    });

    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
};

// GET /api/attachments/task/:taskId
const getAttachmentsByTask = async (req, res, next) => {
  try {
    const attachments = await Attachment.find({ task: req.params.taskId })
      .populate('user', 'username displayName')
      .sort({ createdAt: -1 });
    res.json(attachments);
  } catch (error) {
    next(error);
  }
};

// GET /api/attachments/:attachmentId/download
const downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found.' });

    if (!fs.existsSync(attachment.path)) {
      return res.status(404).json({ error: 'File no longer exists on server.' });
    }

    res.download(attachment.path, attachment.originalName);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/attachments/:attachmentId
const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found.' });

    if (attachment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the uploader or admin can delete this attachment.' });
    }

    // Remove file from disk
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    await Attachment.findByIdAndDelete(req.params.attachmentId);
    res.json({ message: 'Attachment deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAttachment, getAttachmentsByTask, downloadAttachment, deleteAttachment };

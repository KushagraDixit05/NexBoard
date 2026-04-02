const Comment = require('../models/Comment');
const Task    = require('../models/Task');
const eventEmitter = require('../services/eventEmitter.service');
const activityService = require('../services/activity.service');

// POST /api/comments
const createComment = async (req, res, next) => {
  try {
    const { task: taskId, content, mentions } = req.body;

    const comment = await Comment.create({
      task: taskId, user: req.user._id, content, mentions,
    });

    const [populated, taskDoc] = await Promise.all([
      Comment.findById(comment._id)
        .populate('user', 'username displayName avatar')
        .populate('mentions', 'username displayName'),
      Task.findById(taskId).select('title project assignee creator'),
    ]);

    eventEmitter.emit('comment.create', {
      comment:  populated,
      task:     taskDoc,   // full document — title & project now available
      user:     req.user,
      mentions: mentions || [],
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/comments/task/:taskId
const getCommentsByTask = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'username displayName avatar')
      .populate('mentions', 'username displayName')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// PUT /api/comments/:commentId — Author only
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the author can edit this comment.' });
    }

    comment.content = req.body.content;
    await comment.save();

    const populated = await Comment.findById(comment._id)
      .populate('user', 'username displayName avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the author or admin can delete this comment.' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createComment, getCommentsByTask, updateComment, deleteComment };

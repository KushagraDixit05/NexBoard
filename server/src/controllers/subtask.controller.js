const Subtask = require('../models/Subtask');
const eventEmitter = require('../services/eventEmitter.service');

// POST /api/subtasks
const createSubtask = async (req, res, next) => {
  try {
    const { task, title, assignee } = req.body;
    const last = await Subtask.findOne({ task }).sort({ position: -1 });
    const position = last ? last.position + 1 : 0;
    const subtask = await Subtask.create({ task, title, assignee, position });
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
};

// GET /api/subtasks/task/:taskId
const getSubtasksByTask = async (req, res, next) => {
  try {
    const subtasks = await Subtask.find({ task: req.params.taskId })
      .populate('assignee', 'username displayName avatar')
      .sort({ position: 1 });
    res.json(subtasks);
  } catch (error) {
    next(error);
  }
};

// PUT /api/subtasks/:subtaskId
const updateSubtask = async (req, res, next) => {
  try {
    const { title, assignee, timeSpent } = req.body;
    const updates = {};
    if (title     !== undefined) updates.title     = title;
    if (assignee  !== undefined) updates.assignee  = assignee;
    if (timeSpent !== undefined) updates.timeSpent = timeSpent;

    const subtask = await Subtask.findByIdAndUpdate(req.params.subtaskId, updates, { new: true });
    if (!subtask) return res.status(404).json({ error: 'Subtask not found.' });
    res.json(subtask);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/subtasks/:subtaskId/status
const toggleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const subtask = await Subtask.findByIdAndUpdate(
      req.params.subtaskId, { status }, { new: true }
    ).populate('task');

    if (!subtask) return res.status(404).json({ error: 'Subtask not found.' });

    eventEmitter.emit('subtask.update', { subtask, task: subtask.task, user: req.user });
    res.json(subtask);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/subtasks/:subtaskId
const deleteSubtask = async (req, res, next) => {
  try {
    await Subtask.findByIdAndDelete(req.params.subtaskId);
    res.json({ message: 'Subtask deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSubtask, getSubtasksByTask, updateSubtask, toggleStatus, deleteSubtask };

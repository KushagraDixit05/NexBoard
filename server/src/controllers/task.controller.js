const Task = require('../models/Task');
const Column = require('../models/Column');
const eventEmitter = require('../services/eventEmitter.service');
const activityService = require('../services/activity.service');

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, column, board, project, assignee, color,
            priority, dueDate, startDate, timeEstimated, labels, swimlane } = req.body;

    const col = await Column.findById(column);
    if (!col) return res.status(404).json({ error: 'Column not found.' });

    if (col.taskLimit > 0) {
      const taskCount = await Task.countDocuments({ column });
      if (taskCount >= col.taskLimit) {
        return res.status(400).json({ error: `Column "${col.title}" has reached its WIP limit (${col.taskLimit}).` });
      }
    }

    const lastTask = await Task.findOne({ column }).sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title, description, column, board, project, swimlane,
      assignee, creator: req.user._id, color, priority,
      dueDate, startDate, timeEstimated, labels, position,
    });

    eventEmitter.emit('task.create', { task, user: req.user });

    await activityService.log({
      project, task: task._id, user: req.user._id,
      action: 'task.create',
      details: { title: task.title },
      entityType: 'task', entityId: task._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/board/:boardId
const getTasksByBoard = async (req, res, next) => {
  try {
    const tasks = await Task.find({ board: req.params.boardId })
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar')
      .sort({ position: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/column/:columnId
const getTasksByColumn = async (req, res, next) => {
  try {
    const tasks = await Task.find({ column: req.params.columnId })
      .populate('assignee', 'username displayName avatar')
      .sort({ position: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:taskId
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar')
      .populate('column', 'title')
      .populate('board', 'name')
      .populate('swimlane', 'name');

    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:taskId
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const allowedFields = ['title', 'description', 'color', 'priority', 'dueDate',
                           'startDate', 'assignee', 'timeEstimated', 'labels', 'status'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.status === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date();
      eventEmitter.emit('task.close', { task, user: req.user });
    }

    if (updates.assignee && String(updates.assignee) !== String(task.assignee)) {
      eventEmitter.emit('task.assign', { task, user: req.user, assignee: updates.assignee });
    }

    Object.assign(task, updates);
    await task.save();

    eventEmitter.emit('task.update', { task, user: req.user, updates });

    await activityService.log({
      project: task.project, task: task._id, user: req.user._id,
      action: 'task.update', details: updates,
      entityType: 'task', entityId: task._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:taskId
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    eventEmitter.emit('task.delete', { task, user: req.user });
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:taskId/move
const moveTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { targetColumn, targetPosition, targetSwimlane } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const previousColumn   = task.column;
    const previousPosition = task.position;

    if (targetColumn !== task.column.toString()) {
      const col = await Column.findById(targetColumn);
      if (col && col.taskLimit > 0) {
        const taskCount = await Task.countDocuments({ column: targetColumn });
        if (taskCount >= col.taskLimit) {
          return res.status(400).json({ error: `Target column has reached its WIP limit (${col.taskLimit}).` });
        }
      }
    }

    await Task.updateMany(
      { column: previousColumn, position: { $gt: previousPosition } },
      { $inc: { position: -1 } }
    );

    await Task.updateMany(
      { column: targetColumn, position: { $gte: targetPosition } },
      { $inc: { position: 1 } }
    );

    task.column   = targetColumn;
    task.position = targetPosition;
    if (targetSwimlane) task.swimlane = targetSwimlane;
    await task.save();

    eventEmitter.emit('task.move', {
      task, user: req.user,
      from: { column: previousColumn, position: previousPosition },
      to:   { column: targetColumn,   position: targetPosition },
    });

    await activityService.log({
      project: task.project, task: task._id, user: req.user._id,
      action: 'task.move',
      details: { fromColumn: previousColumn, toColumn: targetColumn },
      entityType: 'task', entityId: task._id,
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/reorder
const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // [{ id, position }]
    const ops = tasks.map(({ id, position }) =>
      Task.findByIdAndUpdate(id, { position }, { new: true })
    );
    await Promise.all(ops);
    res.json({ message: 'Tasks reordered.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:taskId/time
const logTime = async (req, res, next) => {
  try {
    const { timeSpent } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId, { $inc: { timeSpent } }, { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/search
const searchTasks = async (req, res, next) => {
  try {
    const { q, project, assignee, status, priority, color, dueBefore, dueAfter } = req.query;
    const filter = {};

    if (project)  filter.project  = project;
    if (assignee) filter.assignee = assignee;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (color)    filter.color    = color;

    if (q) {
      filter.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (dueBefore || dueAfter) {
      filter.dueDate = {};
      if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
      if (dueAfter)  filter.dueDate.$gte = new Date(dueAfter);
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'username displayName avatar')
      .populate('column', 'title')
      .sort({ updatedAt: -1 })
      .limit(100);

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/bulk
const bulkUpdate = async (req, res, next) => {
  try {
    const { taskIds, updates } = req.body;
    const allowedFields = ['status', 'priority', 'assignee', 'color', 'labels'];
    const safeUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) safeUpdates[field] = updates[field];
    }

    await Task.updateMany({ _id: { $in: taskIds } }, safeUpdates);
    res.json({ message: `Updated ${taskIds.length} tasks.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask, getTasksByBoard, getTasksByColumn, getTask,
  updateTask, deleteTask, moveTask, reorderTasks, logTime,
  searchTasks, bulkUpdate,
};

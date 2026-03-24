const Column = require('../models/Column');

// POST /api/columns
const createColumn = async (req, res, next) => {
  try {
    const { board, title, taskLimit, color } = req.body;

    const lastColumn = await Column.findOne({ board }).sort({ position: -1 });
    const position = lastColumn ? lastColumn.position + 1 : 0;

    const column = await Column.create({ board, title, taskLimit, color, position });
    res.status(201).json(column);
  } catch (error) {
    next(error);
  }
};

// GET /api/columns/board/:boardId
const getColumnsByBoard = async (req, res, next) => {
  try {
    const columns = await Column.find({ board: req.params.boardId }).sort({ position: 1 });
    res.json(columns);
  } catch (error) {
    next(error);
  }
};

// PUT /api/columns/:columnId
const updateColumn = async (req, res, next) => {
  try {
    const { title, taskLimit, color } = req.body;
    const updates = {};
    if (title     !== undefined) updates.title     = title;
    if (taskLimit !== undefined) updates.taskLimit = taskLimit;
    if (color     !== undefined) updates.color     = color;

    const column = await Column.findByIdAndUpdate(req.params.columnId, updates, { new: true });
    if (!column) return res.status(404).json({ error: 'Column not found.' });
    res.json(column);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/columns/:columnId
const deleteColumn = async (req, res, next) => {
  try {
    await Column.findByIdAndDelete(req.params.columnId);
    res.json({ message: 'Column deleted.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/columns/reorder — batch update positions
const reorderColumns = async (req, res, next) => {
  try {
    const { columns } = req.body; // [{ id, position }]
    if (!Array.isArray(columns)) {
      return res.status(400).json({ error: 'columns must be an array.' });
    }

    const ops = columns.map(({ id, position }) =>
      Column.findByIdAndUpdate(id, { position }, { new: true })
    );
    const updated = await Promise.all(ops);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { createColumn, getColumnsByBoard, updateColumn, deleteColumn, reorderColumns };

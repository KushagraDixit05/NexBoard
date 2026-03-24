const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Swimlane = require('../models/Swimlane');

// POST /api/boards
const createBoard = async (req, res, next) => {
  try {
    const { name, description, project } = req.body;

    const board = await Board.create({ name, description, project });

    // Create default columns
    const defaultColumns = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    const columns = await Column.insertMany(
      defaultColumns.map((title, index) => ({
        board: board._id,
        title,
        position: index,
      }))
    );

    // Create default swimlane
    await Swimlane.create({ board: board._id, name: 'Default', position: 0 });

    res.status(201).json({ board, columns });
  } catch (error) {
    next(error);
  }
};

// GET /api/boards/project/:projectId
const getBoardsByProject = async (req, res, next) => {
  try {
    const boards = await Board.find({ project: req.params.projectId }).sort({ createdAt: 1 });
    res.json(boards);
  } catch (error) {
    next(error);
  }
};

// GET /api/boards/:boardId — Full board with columns, tasks, swimlanes
const getBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId).populate('project', 'name color');
    if (!board) return res.status(404).json({ error: 'Board not found.' });

    const [columns, tasks, swimlanes] = await Promise.all([
      Column.find({ board: boardId }).sort({ position: 1 }),
      Task.find({ board: boardId })
        .populate('assignee', 'username displayName avatar')
        .populate('creator', 'username displayName avatar')
        .sort({ position: 1 }),
      Swimlane.find({ board: boardId, isActive: true }).sort({ position: 1 }),
    ]);

    // Group tasks by column
    const columnData = columns.map(col => ({
      ...col.toObject(),
      tasks: tasks.filter(t => t.column.toString() === col._id.toString()),
    }));

    res.json({ board, columns: columnData, swimlanes });
  } catch (error) {
    next(error);
  }
};

// PUT /api/boards/:boardId
const updateBoard = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const updates = {};
    if (name        !== undefined) updates.name        = name;
    if (description !== undefined) updates.description = description;
    if (isActive    !== undefined) updates.isActive    = isActive;

    const board = await Board.findByIdAndUpdate(req.params.boardId, updates, { new: true });
    if (!board) return res.status(404).json({ error: 'Board not found.' });
    res.json(board);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/boards/:boardId
const deleteBoard = async (req, res, next) => {
  try {
    await Board.findByIdAndDelete(req.params.boardId);
    res.json({ message: 'Board deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBoard, getBoardsByProject, getBoard, updateBoard, deleteBoard };

const Swimlane = require('../models/Swimlane');

const createSwimlane = async (req, res, next) => {
  try {
    const { board, name } = req.body;
    const last = await Swimlane.findOne({ board }).sort({ position: -1 });
    const position = last ? last.position + 1 : 0;
    const swimlane = await Swimlane.create({ board, name, position });
    res.status(201).json(swimlane);
  } catch (error) {
    next(error);
  }
};

const getSwimlanesByBoard = async (req, res, next) => {
  try {
    const swimlanes = await Swimlane.find({ board: req.params.boardId }).sort({ position: 1 });
    res.json(swimlanes);
  } catch (error) {
    next(error);
  }
};

const updateSwimlane = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;
    const updates = {};
    if (name     !== undefined) updates.name     = name;
    if (isActive !== undefined) updates.isActive = isActive;

    const swimlane = await Swimlane.findByIdAndUpdate(req.params.swimlaneId, updates, { new: true });
    if (!swimlane) return res.status(404).json({ error: 'Swimlane not found.' });
    res.json(swimlane);
  } catch (error) {
    next(error);
  }
};

const deleteSwimlane = async (req, res, next) => {
  try {
    await Swimlane.findByIdAndDelete(req.params.swimlaneId);
    res.json({ message: 'Swimlane deleted.' });
  } catch (error) {
    next(error);
  }
};

const reorderSwimlanes = async (req, res, next) => {
  try {
    const { swimlanes } = req.body;
    const ops = swimlanes.map(({ id, position }) =>
      Swimlane.findByIdAndUpdate(id, { position }, { new: true })
    );
    const updated = await Promise.all(ops);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSwimlane, getSwimlanesByBoard, updateSwimlane, deleteSwimlane, reorderSwimlanes };

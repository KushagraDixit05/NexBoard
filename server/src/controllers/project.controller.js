const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const activityService = require('../services/activity.service');

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      owner:   req.user._id,
      members: [{ user: req.user._id, role: 'manager' }],
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const { archived } = req.query;
    const filter = req.user.role === 'admin'
      ? {}
      : { $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] };

    if (archived === 'true')  filter.isArchived = true;
    else if (archived !== 'all') filter.isArchived = false; // default: active only

    const projects = await Project.find(filter)
      .populate('owner', 'username displayName avatar')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:projectId
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'username displayName avatar')
      .populate('members.user', 'username displayName avatar');

    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:projectId
const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const updates = {};
    if (name        !== undefined) updates.name        = name;
    if (description !== undefined) updates.description = description;
    if (color       !== undefined) updates.color       = color;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId, updates, { new: true, runValidators: true }
    );

    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:projectId
const deleteProject = async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:projectId/archive
const archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    project.isArchived = !project.isArchived;
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:projectId/members
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(409).json({ error: 'User is already a member.' });
    }

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:projectId/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:projectId/members/:userId/role
const changeMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const member = project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ error: 'Member not found.' });

    member.role = role;
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:projectId/activity
const getActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const { activities, total } = await activityService.getForProject(req.params.projectId, { page, limit });

    res.json({
      activities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject, getProjects, getProject, updateProject, deleteProject,
  archiveProject, addMember, removeMember, changeMemberRole, getActivity,
};

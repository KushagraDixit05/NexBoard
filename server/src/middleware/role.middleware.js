const Project = require('../models/Project');

/**
 * Restrict to specific system-level roles (admin/manager/user).
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

/**
 * Check that the authenticated user is a member (or owner/admin) of a project.
 * Reads projectId from req.params.projectId or req.body.project.
 * Attaches req.project and req.projectRole to the request.
 */
const projectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project;

    if (!projectId) return next(); // No project context needed

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isAdmin) {
      return res.status(403).json({ error: 'Not a member of this project.' });
    }

    req.project = project;
    req.projectRole = isOwner
      ? 'owner'
      : (project.members.find(m => m.user.toString() === req.user._id.toString())?.role || 'member');

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require the user to be the project owner or admin.
 * Must be used AFTER projectMember middleware.
 */
const projectOwner = (req, res, next) => {
  if (req.projectRole !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the project owner can perform this action.' });
  }
  next();
};

module.exports = { authorize, projectMember, projectOwner };

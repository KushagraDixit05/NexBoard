const ActivityLog = require('../models/ActivityLog');

const activityService = {
  /**
   * Log an activity event. Designed to be non-blocking — failures are swallowed.
   */
  async log({ project, task, user, action, details, entityType, entityId }) {
    try {
      await ActivityLog.create({ project, task, user, action, details, entityType, entityId });
    } catch (error) {
      console.error('[ActivityService] Logging failed:', error.message);
      // Non-blocking — don't propagate
    }
  },

  /**
   * Get paginated activity log for a project.
   */
  async getForProject(projectId, { page = 1, limit = 30 } = {}) {
    const activities = await ActivityLog.find({ project: projectId })
      .populate('user', 'username displayName avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments({ project: projectId });
    return { activities, total };
  },
};

module.exports = activityService;

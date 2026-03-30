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

  /**
   * Get heatmap data for a user (task completions by date).
   * Returns data for the current year.
   */
  async getUserHeatmapData(userId, startDate, endDate) {
    try {
      // Aggregate task completion activities by date
      const activities = await ActivityLog.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: startDate, $lte: endDate },
            $or: [
              { action: 'task.complete' },
              { action: 'task.status.change', 'details.to': 'completed' }
            ]
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            count: 1
          }
        },
        {
          $sort: { date: 1 }
        }
      ]);

      return activities; // Array of { date: "YYYY-MM-DD", count: number }
    } catch (error) {
      console.error('[ActivityService] Heatmap query failed:', error.message);
      return [];
    }
  },
};

module.exports = activityService;

const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const analyticsService = {
  /**
   * Overview stats for a project.
   */
  async getProjectStats(projectId) {
    const [taskStats, activityCount] = await Promise.all([
      Task.aggregate([
        { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(projectId) } },
        {
          $group: {
            _id:           '$status',
            count:         { $sum: 1 },
            totalEstimated:{ $sum: '$timeEstimated' },
            totalSpent:    { $sum: '$timeSpent' },
          },
        },
      ]),
      ActivityLog.countDocuments({ project: projectId }),
    ]);

    const stats = {
      tasksByStatus: taskStats.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      totalTasks:    taskStats.reduce((sum, s) => sum + s.count, 0),
      activityCount,
    };

    return stats;
  },

  /**
   * Task completion rate over time (last N days).
   */
  async getCompletionTrend(projectId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trend = await Task.aggregate([
      {
        $match: {
          project:     require('mongoose').Types.ObjectId.createFromHexString(projectId),
          status:      'completed',
          completedAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day:   { $dayOfMonth: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return trend.map(d => ({
      date:  `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`,
      count: d.count,
    }));
  },

  /**
   * Workload distribution per team member.
   */
  async getWorkloadPerUser(projectId) {
    return Task.aggregate([
      {
        $match: {
          project:  require('mongoose').Types.ObjectId.createFromHexString(projectId),
          assignee: { $exists: true, $ne: null },
          status:   { $in: ['open', 'in_progress'] },
        },
      },
      {
        $group: {
          _id:   '$assignee',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from:         'users',
          localField:   '_id',
          foreignField: '_id',
          as:           'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id:         0,
          userId:      '$_id',
          displayName: '$user.displayName',
          username:    '$user.username',
          avatar:      '$user.avatar',
          taskCount:   '$count',
        },
      },
      { $sort: { taskCount: -1 } },
    ]);
  },

  /**
   * Overdue tasks count.
   */
  async getOverdueTasks(projectId) {
    const now = new Date();
    return Task.find({
      project:  projectId,
      status:   { $in: ['open', 'in_progress'] },
      dueDate:  { $lt: now },
    })
      .populate('assignee', 'username displayName avatar')
      .populate('column', 'title')
      .sort({ dueDate: 1 })
      .limit(50);
  },
};

module.exports = analyticsService;

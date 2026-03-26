const Task = require('../models/Task');

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Count open tasks assigned to the current user
    const openTasks = await Task.countDocuments({
      assignee: userId,
      status: 'open'
    });

    // Calculate date 7 days ago for "this week" filter
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count tasks completed in the last 7 days
    const completedThisWeek = await Task.countDocuments({
      assignee: userId,
      status: 'completed',
      completedAt: { $gte: oneWeekAgo }
    });

    res.json({
      openTasks,
      completedThisWeek
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const analyticsService = require('../services/analytics.service');

router.use(authenticate);

// GET /api/analytics/:projectId/stats
router.get('/:projectId/stats', async (req, res, next) => {
  try {
    const stats = await analyticsService.getProjectStats(req.params.projectId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/:projectId/trend?days=30
router.get('/:projectId/trend', async (req, res, next) => {
  try {
    const { days } = req.query;
    const trend = await analyticsService.getCompletionTrend(req.params.projectId, parseInt(days) || 30);
    res.json(trend);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/:projectId/workload
router.get('/:projectId/workload', async (req, res, next) => {
  try {
    const workload = await analyticsService.getWorkloadPerUser(req.params.projectId);
    res.json(workload);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/:projectId/overdue
router.get('/:projectId/overdue', async (req, res, next) => {
  try {
    const overdue = await analyticsService.getOverdueTasks(req.params.projectId);
    res.json(overdue);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

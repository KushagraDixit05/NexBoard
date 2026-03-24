const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

router.use(authenticate);

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getForUser(req.user._id, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read — mark specific notifications as read
router.patch('/read', async (req, res, next) => {
  try {
    const { ids } = req.body;
    await notificationService.markRead(ids, req.user._id);
    res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user._id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

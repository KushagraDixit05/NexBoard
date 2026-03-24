const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const webhookService = require('../services/webhook.service');

router.use(authenticate);

// POST /api/webhooks/test — Test a webhook URL
router.post('/test', async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Webhook URL is required.' });

    await webhookService.fire(url, webhookService.buildPayload('webhook.test', {
      message: 'This is a test webhook from NexBoard',
      user:    req.user.username,
    }));

    res.json({ message: 'Test webhook fired.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

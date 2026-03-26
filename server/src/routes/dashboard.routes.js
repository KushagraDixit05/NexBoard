const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats
router.get('/stats', getStats);

module.exports = router;

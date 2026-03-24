// --- Subtask Routes ---
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createSubtask, getSubtasksByTask, updateSubtask, toggleStatus, deleteSubtask } = require('../controllers/subtask.controller');
router.use(authenticate);
router.post('/', createSubtask);
router.get('/task/:taskId', getSubtasksByTask);
router.put('/:subtaskId', updateSubtask);
router.patch('/:subtaskId/status', toggleStatus);
router.delete('/:subtaskId', deleteSubtask);
module.exports = router;

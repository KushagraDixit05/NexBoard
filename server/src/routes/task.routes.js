const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const taskValidator = require('../validators/task.validator');
const {
  createTask, getTasksByBoard, getTasksByColumn, getTask,
  updateTask, deleteTask, moveTask, reorderTasks, logTime,
  searchTasks, bulkUpdate,
} = require('../controllers/task.controller');

router.use(authenticate);

router.post('/',               validate(taskValidator.createSchema), createTask);
router.post('/bulk',           bulkUpdate);
router.get('/search',          searchTasks);
router.patch('/reorder',       reorderTasks);
router.get('/board/:boardId',  getTasksByBoard);
router.get('/column/:columnId',getTasksByColumn);
router.get('/:taskId',         getTask);
router.put('/:taskId',         validate(taskValidator.updateSchema), updateTask);
router.delete('/:taskId',      deleteTask);
router.patch('/:taskId/move',  validate(taskValidator.moveSchema), moveTask);
router.patch('/:taskId/time',  logTime);

module.exports = router;

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createColumn, getColumnsByBoard, updateColumn, deleteColumn, reorderColumns } = require('../controllers/column.controller');

router.use(authenticate);

router.post('/', createColumn);
router.get('/board/:boardId', getColumnsByBoard);
router.patch('/reorder', reorderColumns);
router.put('/:columnId', updateColumn);
router.delete('/:columnId', deleteColumn);

module.exports = router;

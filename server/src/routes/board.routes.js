const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createBoard, getBoardsByProject, getBoard, updateBoard, deleteBoard } = require('../controllers/board.controller');

router.use(authenticate);

router.post('/', createBoard);
router.get('/project/:projectId', getBoardsByProject);
router.get('/:boardId', getBoard);
router.put('/:boardId', updateBoard);
router.delete('/:boardId', deleteBoard);

module.exports = router;

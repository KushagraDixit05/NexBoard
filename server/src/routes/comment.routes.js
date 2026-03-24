const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createComment, getCommentsByTask, updateComment, deleteComment } = require('../controllers/comment.controller');
router.use(authenticate);
router.post('/', createComment);
router.get('/task/:taskId', getCommentsByTask);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);
module.exports = router;

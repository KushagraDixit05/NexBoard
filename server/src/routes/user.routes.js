const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getAllUsers, getUserById, updateProfile, updatePreferences,
  changeRole, deactivateUser, deleteUser,
} = require('../controllers/user.controller');

router.use(authenticate);

// Self-service (any authenticated user)
router.put('/profile',     updateProfile);
router.put('/preferences', updatePreferences);

// Admin-only
router.get('/',                 authorize('admin'), getAllUsers);
router.get('/:id',              authorize('admin'), getUserById);
router.patch('/:id/role',       authorize('admin'), changeRole);
router.patch('/:id/deactivate', authorize('admin'), deactivateUser);
router.delete('/:id',          authorize('admin'), deleteUser);

module.exports = router;

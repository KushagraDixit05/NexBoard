const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { projectMember, projectOwner } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const projectValidator = require('../validators/project.validator');
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
  archiveProject, addMember, removeMember, changeMemberRole, getActivity,
} = require('../controllers/project.controller');

router.use(authenticate);

router.post('/', validate(projectValidator.createSchema), createProject);
router.get('/', getProjects);
router.get('/:projectId', projectMember, getProject);
router.put('/:projectId', projectMember, validate(projectValidator.updateSchema), updateProject);
router.delete('/:projectId', projectMember, projectOwner, deleteProject);
router.patch('/:projectId/archive', projectMember, projectOwner, archiveProject);
router.get('/:projectId/activity', projectMember, getActivity);

// Member management (manager or owner only)
router.post('/:projectId/members', projectMember, validate(projectValidator.addMemberSchema), addMember);
router.delete('/:projectId/members/:userId', projectMember, projectOwner, removeMember);
router.patch('/:projectId/members/:userId/role', projectMember, projectOwner, validate(projectValidator.changeMemberRoleSchema), changeMemberRole);

module.exports = router;

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const automationValidator = require('../validators/automation.validator');
const AutomationRule = require('../models/AutomationRule');

router.use(authenticate);

// POST /api/automation
router.post('/', validate(automationValidator.createSchema), async (req, res, next) => {
  try {
    const { name, description, trigger, actions } = req.body;
    const projectId = req.body.project || req.query.project;

    const rule = await AutomationRule.create({
      project: projectId,
      name, description, trigger, actions,
      createdBy: req.user._id,
    });
    res.status(201).json(rule);
  } catch (error) {
    next(error);
  }
});

// GET /api/automation/project/:projectId
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const rules = await AutomationRule.find({ project: req.params.projectId })
      .populate('createdBy', 'username displayName')
      .sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    next(error);
  }
});

// PUT /api/automation/:ruleId
router.put('/:ruleId', validate(automationValidator.updateSchema), async (req, res, next) => {
  try {
    const rule = await AutomationRule.findByIdAndUpdate(
      req.params.ruleId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!rule) return res.status(404).json({ error: 'Automation rule not found.' });
    res.json(rule);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/automation/:ruleId/toggle
router.patch('/:ruleId/toggle', async (req, res, next) => {
  try {
    const rule = await AutomationRule.findById(req.params.ruleId);
    if (!rule) return res.status(404).json({ error: 'Automation rule not found.' });
    rule.isActive = !rule.isActive;
    await rule.save();
    res.json(rule);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/automation/:ruleId
router.delete('/:ruleId', async (req, res, next) => {
  try {
    await AutomationRule.findByIdAndDelete(req.params.ruleId);
    res.json({ message: 'Automation rule deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

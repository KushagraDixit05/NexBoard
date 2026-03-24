const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

/**
 * Initialize all scheduled jobs.
 * Called once at server startup from index.js.
 */
const initScheduler = () => {
  console.log('[Scheduler] Initializing cron jobs...');

  // --- Due-date reminder: runs every day at 8:00 AM ---
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running due-date reminder job...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueSoonTasks = await Task.find({
        status:  { $in: ['open', 'in_progress'] },
        dueDate: { $gte: today, $lte: tomorrow },
        assignee: { $exists: true, $ne: null },
      }).populate('assignee', 'email displayName notificationPreferences');

      for (const task of dueSoonTasks) {
        if (!task.assignee) continue;

        // In-app notification
        await notificationService.create({
          userId:  task.assignee._id,
          type:    'task_due_soon',
          title:   'Task Due Soon',
          message: `"${task.title}" is due tomorrow`,
          data:    { taskId: task._id },
        });

        // Email notification (if enabled)
        if (task.assignee.notificationPreferences?.email) {
          await emailService.sendDueSoonReminder({
            toEmail:      task.assignee.email,
            assigneeName: task.assignee.displayName || 'there',
            taskTitle:    task.title,
            dueDate:      task.dueDate,
            taskUrl:      `${process.env.CORS_ORIGIN}/projects/${task.project}/board`,
          });
        }
      }

      console.log(`[Scheduler] Due-date reminders sent for ${dueSoonTasks.length} tasks.`);
    } catch (error) {
      console.error('[Scheduler] Due-date job error:', error.message);
    }
  });

  // --- Recurring task spawner: runs every day at midnight ---
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Running recurring task job...');
    try {
      const now = new Date();
      const recurringTasks = await Task.find({
        isRecurring:              true,
        'recurringConfig.nextDue': { $lte: now },
        status:                   { $ne: 'archived' },
      });

      for (const task of recurringTasks) {
        // Clone the task
        const newTaskData = {
          title:         task.title,
          description:   task.description,
          column:        task.column,
          board:         task.board,
          project:       task.project,
          swimlane:      task.swimlane,
          assignee:      task.assignee,
          creator:       task.creator,
          color:         task.color,
          priority:      task.priority,
          timeEstimated: task.timeEstimated,
          labels:        task.labels,
        };

        await Task.create(newTaskData);

        // Calculate next due date
        const cfg = task.recurringConfig;
        const nextDue = new Date(cfg.nextDue);
        if (cfg.frequency === 'daily')   nextDue.setDate(nextDue.getDate() + (cfg.interval || 1));
        if (cfg.frequency === 'weekly')  nextDue.setDate(nextDue.getDate() + 7 * (cfg.interval || 1));
        if (cfg.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + (cfg.interval || 1));

        task.recurringConfig.nextDue = nextDue;
        await task.save();
      }

      console.log(`[Scheduler] Spawned ${recurringTasks.length} recurring tasks.`);
    } catch (error) {
      console.error('[Scheduler] Recurring task job error:', error.message);
    }
  });

  console.log('[Scheduler] ✅ All cron jobs initialized.');
};

module.exports = { initScheduler };

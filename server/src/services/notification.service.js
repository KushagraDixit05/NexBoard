const Notification = require('../models/Notification');
const User         = require('../models/User');
const webhookService = require('./webhook.service');
const eventEmitter = require('./eventEmitter.service');

const notificationService = {
  /**
   * Create an in-app notification for a user.
   * Also fires the user's configured webhook URL if present.
   */
  async create({ userId, type, title, message, link, data }) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        link,
        data,
      });

      // Fire outgoing webhook if the user has one configured
      setImmediate(async () => {
        try {
          const user = await User.findById(userId).select('notificationPreferences displayName username');
          const webhookUrl = user?.notificationPreferences?.webhookUrl;
          if (webhookUrl) {
            await webhookService.sendSlack(webhookUrl, {
              text: `*${title}*\n${message}`,
              fields: link ? [{ title: 'View', value: link }] : [],
            });
          }
        } catch (err) {
          console.error('[NotificationService] Webhook fire failed:', err.message);
        }
      });

      return notification;
    } catch (error) {
      console.error('[NotificationService] Create failed:', error.message);
    }
  },

  /**
   * Get all notifications for a user (paginated).
   */
  async getForUser(userId, { page = 1, limit = 20 } = {}) {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ user: userId });
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return { notifications, total, unreadCount };
  },

  /**
   * Mark notification(s) as read.
   */
  async markRead(notificationIds, userId) {
    return Notification.updateMany(
      { _id: { $in: notificationIds }, user: userId },
      { isRead: true }
    );
  },

  /**
   * Mark all notifications as read for a user.
   */
  async markAllRead(userId) {
    return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  },
};

// --- Register event listeners ---

eventEmitter.on('task.assign', async ({ task, assignee }) => {
  if (!assignee) return;
  await notificationService.create({
    userId:  assignee._id || assignee,
    type:    'task_assigned',
    title:   'Task Assigned',
    message: `You have been assigned to "${task.title}"`,
    link:    `/projects/${task.project}/board`,
    data:    { taskId: task._id },
  });
});

eventEmitter.on('comment.create', async ({ comment, task, user, mentions }) => {
  if (!task) return;

  // 1. Notify @mentioned users
  if (mentions && mentions.length > 0) {
    for (const userId of mentions) {
      // Don't notify the commenter about their own mention
      if (String(userId) === String(user._id)) continue;
      await notificationService.create({
        userId,
        type:    'task_mentioned',
        title:   'You were mentioned',
        message: `You were mentioned in a comment on "${task.title}"`,
        link:    `/projects/${task.project}/board`,
        data:    { taskId: task._id, commentId: comment._id },
      });
    }
  }

  // 2. Notify the task's assignee (if they're not the commenter and not already mentioned)
  const mentionSet = new Set((mentions || []).map(String));
  const commenterId = String(user._id);

  const interestedUsers = [task.assignee, task.creator].filter(Boolean);
  for (const recipientId of interestedUsers) {
    const rid = String(recipientId);
    if (rid === commenterId) continue;       // Skip the commenter themselves
    if (mentionSet.has(rid)) continue;       // Already notified via @mention
    await notificationService.create({
      userId:  recipientId,
      type:    'task_commented',
      title:   'New comment on your task',
      message: `${user.displayName || user.username} commented on "${task.title}"`,
      link:    `/projects/${task.project}/board`,
      data:    { taskId: task._id, commentId: comment._id },
    });
    mentionSet.add(rid); // Prevent duplicate if assignee === creator
  }
});

module.exports = notificationService;

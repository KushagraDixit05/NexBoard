const Notification = require('../models/Notification');
const eventEmitter = require('./eventEmitter.service');

const notificationService = {
  /**
   * Create an in-app notification for a user.
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

eventEmitter.on('comment.create', async ({ comment, task, mentions }) => {
  if (!mentions || mentions.length === 0) return;
  for (const userId of mentions) {
    await notificationService.create({
      userId,
      type:    'task_mentioned',
      title:   'You were mentioned',
      message: `You were mentioned in a comment on "${task.title}"`,
      link:    `/projects/${task.project}/board`,
      data:    { taskId: task._id, commentId: comment._id },
    });
  }
});

module.exports = notificationService;

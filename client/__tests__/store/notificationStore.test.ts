import { useNotificationStore } from '@/store/notificationStore';
import api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get:   jest.fn(),
    patch: jest.fn(),
  },
}));

const mockNotifications = [
  { _id: 'n1', type: 'task_assigned', title: 'Task Assigned', message: 'You got a task', isRead: false, createdAt: new Date().toISOString() },
  { _id: 'n2', type: 'task_commented', title: 'New Comment', message: 'Someone commented', isRead: true,  createdAt: new Date().toISOString() },
];

describe('NotificationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
  });

  // ── fetchNotifications ──────────────────────────────────────────────────────

  describe('fetchNotifications', () => {
    it('fetches and stores notifications with correct unread count from API', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: { notifications: mockNotifications, unreadCount: 1 },
      });

      await useNotificationStore.getState().fetchNotifications();

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(api.get).toHaveBeenCalledWith('/notifications');
      expect(notifications).toHaveLength(2);
      expect(unreadCount).toBe(1);
    });

    it('falls back to counting unread locally if API omits unreadCount', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: { notifications: mockNotifications }, // no unreadCount field
      });

      await useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().unreadCount).toBe(1); // only n1 is unread
    });

    it('silently fails and keeps existing state on API error', async () => {
      useNotificationStore.setState({ notifications: mockNotifications, unreadCount: 1 });
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await useNotificationStore.getState().fetchNotifications();

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(notifications).toHaveLength(2); // unchanged
      expect(unreadCount).toBe(1);           // unchanged
    });
  });

  // ── markAsRead ──────────────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('marks a notification as read and decrements unreadCount', async () => {
      useNotificationStore.setState({ notifications: mockNotifications, unreadCount: 1 });
      (api.patch as jest.Mock).mockResolvedValueOnce({});

      await useNotificationStore.getState().markAsRead('n1');

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(api.patch).toHaveBeenCalledWith('/notifications/read', { ids: ['n1'] });
      expect(notifications.find(n => n._id === 'n1')?.isRead).toBe(true);
      expect(unreadCount).toBe(0);
    });

    it('never lets unreadCount drop below 0', async () => {
      useNotificationStore.setState({ notifications: mockNotifications, unreadCount: 0 });
      (api.patch as jest.Mock).mockResolvedValueOnce({});

      await useNotificationStore.getState().markAsRead('n1');

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  // ── markAllRead ─────────────────────────────────────────────────────────────

  describe('markAllRead', () => {
    it('marks every notification as read and resets unreadCount to 0', async () => {
      useNotificationStore.setState({ notifications: mockNotifications, unreadCount: 1 });
      (api.patch as jest.Mock).mockResolvedValueOnce({});

      await useNotificationStore.getState().markAllRead();

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(api.patch).toHaveBeenCalledWith('/notifications/read-all');
      expect(notifications.every(n => n.isRead)).toBe(true);
      expect(unreadCount).toBe(0);
    });
  });
});

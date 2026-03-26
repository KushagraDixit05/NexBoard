'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { User, Bell, Mail, Webhook } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');

  // Preferences form state
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [digest, setDigest] = useState<'none' | 'daily' | 'weekly'>('none');
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatar(user.avatar || '');
      setEmailNotif(user.notificationPreferences?.email ?? true);
      setInAppNotif(user.notificationPreferences?.inApp ?? true);
      setDigest(user.notificationPreferences?.digest || 'none');
      setWebhookUrl(user.notificationPreferences?.webhookUrl || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      setSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await api.put('/users/preferences', {
        notificationPreferences: {
          email: emailNotif,
          inApp: inAppNotif,
          digest,
          webhookUrl: webhookUrl.trim() || undefined,
        },
      });
      // Manually update user state for preferences
      await useAuthStore.getState().fetchMe();
      setSuccess('Notification preferences updated successfully!');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="animate-pulse h-40 bg-muted rounded-lg" />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-3 bg-success/10 text-success text-sm rounded-md border border-success/30">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/30">
          {error}
        </div>
      )}

      {/* User Profile Section */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">User Profile</h2>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Display Name</label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Avatar URL</label>
            <input
              type="url"
              className="input-field"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              className="input-field bg-muted"
              value={user.email}
              disabled
              readOnly
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <input
              type="text"
              className="input-field bg-muted capitalize"
              value={user.role}
              disabled
              readOnly
            />
            <p className="text-xs text-muted-foreground mt-1">Contact an admin to change your role</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences Section */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
        </div>

        <form onSubmit={handlePreferencesUpdate} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-primary peer-checked:after:bg-primary-foreground peer-checked:after:border-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">In-App Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications in the app</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={inAppNotif}
                onChange={(e) => setInAppNotif(e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-primary peer-checked:after:bg-primary-foreground peer-checked:after:border-primary"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Digest Frequency</label>
            <select
              className="input-field"
              value={digest}
              onChange={(e) => setDigest(e.target.value as 'none' | 'daily' | 'weekly')}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">Receive a summary of notifications</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhook URL (Optional)
            </label>
            <input
              type="url"
              className="input-field"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-webhook-url.com/endpoint"
            />
            <p className="text-xs text-muted-foreground mt-1">Send notifications to this webhook endpoint</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

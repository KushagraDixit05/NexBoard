'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface AddMemberDialogProps {
  projectId:  string;
  onSuccess:  () => void;
  onCancel:   () => void;
}

export default function AddMemberDialog({ projectId, onSuccess, onCancel }: AddMemberDialogProps) {
  const [email, setEmail]   = useState('');
  const [role, setRole]     = useState<'member' | 'manager'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Find user by email first
      const { data: users } = await api.get(`/users?search=${encodeURIComponent(email)}&limit=1`);
      const user = (users.users ?? users)[0];
      if (!user) {
        setError('No user found with that email.');
        return;
      }
      await api.post(`/projects/${projectId}/members`, { userId: user._id, role });
      onSuccess();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-danger-50 text-danger-600 text-sm rounded-lg border border-danger-200">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
        <input type="email" className="input-field" value={email}
               onChange={e => setEmail(e.target.value)} required placeholder="user@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select className="input-field" value={role}
                onChange={e => setRole(e.target.value as 'member' | 'manager')}>
          <option value="member">Member</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}

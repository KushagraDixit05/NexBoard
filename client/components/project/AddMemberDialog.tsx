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
      // Find user by email using new search endpoint
      const { data: users } = await api.get(`/users/search?email=${encodeURIComponent(email)}`);
      if (!users || users.length === 0) {
        setError('No user found with that email.');
        return;
      }
      const user = users[0];
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
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/30">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">User Email</label>
        <input type="email" className="input-field" value={email}
               onChange={e => setEmail(e.target.value)} required placeholder="user@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Role</label>
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

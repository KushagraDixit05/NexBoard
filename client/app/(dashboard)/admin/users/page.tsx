'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Shield, UserX } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/users${q}`).then(r => setUsers(r.data.users ?? r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    await api.patch(`/users/${userId}/role`, { role });
    fetchUsers();
  };

  const handleDeactivate = async (userId: string) => {
    await api.patch(`/users/${userId}/deactivate`);
    setDeactivating(null);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">{users.length} users</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input className="input-field max-w-sm" placeholder="Search users..."
                 value={search} onChange={e => setSearch(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="p-4 animate-pulse flex gap-4"><div className="w-10 h-10 bg-gray-100 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 rounded w-48" /><div className="h-3 bg-gray-100 rounded w-32" /></div></div>)
          ) : users.map(user => (
            <div key={user._id} className="flex items-center gap-4 p-4">
              <Avatar name={user.displayName || user.username} size="md" src={user.avatar} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{user.displayName || user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Badge variant={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <select
                value={user.role}
                onChange={e => handleRoleChange(user._id, e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => setDeactivating(user._id)}
                className="p-2 text-gray-400 hover:text-danger-500 rounded-lg transition-colors"
                title="Deactivate"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deactivating} onClose={() => setDeactivating(null)}
        onConfirm={() => deactivating && handleDeactivate(deactivating)}
        title="Deactivate User?" description="This user will be signed out and unable to log in."
        confirmLabel="Deactivate"
      />
    </div>
  );
}

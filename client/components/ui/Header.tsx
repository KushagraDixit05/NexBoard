'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import Avatar from './Avatar';
import ThemeSwitcher from './ThemeSwitcher';
import Dropdown from './Dropdown';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects and tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full pl-10 pr-4 py-2 bg-muted border border-input rounded-md text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background
                     transition-colors placeholder:text-muted-foreground"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <button
          onClick={() => router.push('/dashboard/notifications')}
          className="relative p-2 rounded-md hover:bg-accent transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground
                             text-[10px] rounded-full flex items-center justify-center px-1 font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Info with Dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-3 ml-2 hover:bg-accent rounded-md p-1.5 transition-colors">
              <Avatar name={user?.displayName || user?.username || 'U'} size="sm" />
              <div className="hidden sm:block min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">{user?.displayName || user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </button>
          }
          items={[
            {
              label: 'Profile & Settings',
              icon: <Settings className="w-4 h-4" />,
              onClick: () => router.push('/dashboard/settings'),
            },
            {
              label: 'Logout',
              icon: <LogOut className="w-4 h-4" />,
              onClick: handleLogout,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
}

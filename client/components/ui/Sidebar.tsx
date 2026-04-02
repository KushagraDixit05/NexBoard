'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import {
  LayoutDashboard, FolderKanban, Bell, Settings, Users, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard',     href: '/dashboard',              icon: LayoutDashboard },
  { name: 'Projects',      href: '/dashboard/projects',      icon: FolderKanban },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
];

const adminNav = [
  { name: 'Users',    href: '/dashboard/admin/users',    icon: Users },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount }  = useNotificationStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-card border-r border-border
                       flex flex-col transition-all duration-200 shrink-0`}>
      {/* Logo + Collapse */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        {!collapsed && (
          <span className="text-xl font-bold text-foreground truncate">NexBoard</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-md hover:bg-accent text-muted-foreground shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-colors ${isActive(item.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                title={collapsed ? item.name : undefined}>
            <span className="relative">
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-destructive text-destructive-foreground
                                 text-[9px] rounded-full flex items-center justify-center px-0.5 font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}

        {user?.role === 'admin' && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-1 px-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
              </div>
            )}
            {collapsed && <div className="my-2 border-t border-border" />}
            {adminNav.map((item) => (
              <Link key={item.name} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                      transition-colors ${isActive(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    title={collapsed ? item.name : undefined}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-border p-3">
        {!collapsed && user && (
          <div className="px-2 py-1 mb-1">
            <p className="text-sm font-medium text-foreground truncate">{user.displayName || user.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <button onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm
                           text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title={collapsed ? 'Logout' : undefined}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

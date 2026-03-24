# Phase 3: Frontend Development — Core UI

**Timeline:** Week 7–8  
**Focus:** Build the complete Next.js 14 frontend with Kanban board, task management, and user interfaces  
**Effort Split:** 85% Implementation, 15% Integration Testing

---

## 1. Objectives

- Set up Next.js 14 with App Router, Tailwind CSS, and TypeScript
- Implement authentication UI (login, register, protected routes)
- Build the dashboard with project listing and activity stream
- Create the Kanban board view with drag-and-drop columns and tasks
- Build task detail modal with Markdown editing, subtasks, comments, attachments, and time tracking
- Implement user management admin panel
- Set up state management with Zustand
- Build reusable component library
- Connect all UI to the Express backend API

---

## 2. Project Configuration

### 2.1 Next.js Config (`client/next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],  // For user avatars and attachments
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',  // Proxy to Express backend
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2.2 Tailwind Config (`client/tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:   { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        secondary: { 50: '#f8fafc', 100: '#f1f5f9', 500: '#64748b', 600: '#475569' },
        success:   { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
        warning:   { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
        danger:    { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
        board:     { bg: '#f1f5f9', column: '#ffffff', card: '#ffffff' },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
        column: '0 1px 3px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 2.3 Global Styles (`client/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 
           transition-colors duration-200 font-medium text-sm;
  }
  .btn-secondary {
    @apply bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 
           hover:bg-gray-50 transition-colors duration-200 font-medium text-sm;
  }
  .btn-danger {
    @apply bg-danger-500 text-white px-4 py-2 rounded-lg hover:bg-danger-600 
           transition-colors duration-200 font-medium text-sm;
  }
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
           focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm;
  }
  .card {
    @apply bg-white rounded-lg shadow-card border border-gray-100;
  }
}
```

---

## 3. TypeScript Interfaces

### 3.1 Core Types (`client/types/index.ts`)

```typescript
// ─── User ────────────────────────────────────────────
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  displayName: string;
  avatar?: string;
  isActive: boolean;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  digest: 'none' | 'daily' | 'weekly';
  webhookUrl?: string;
}

// ─── Project ─────────────────────────────────────────
export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User;
  members: ProjectMember[];
  isArchived: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  user: User;
  role: 'manager' | 'member';
}

// ─── Board ───────────────────────────────────────────
export interface Board {
  _id: string;
  project: string | Project;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BoardData {
  board: Board;
  columns: ColumnWithTasks[];
  swimlanes: Swimlane[];
}

// ─── Column ──────────────────────────────────────────
export interface Column {
  _id: string;
  board: string;
  title: string;
  position: number;
  taskLimit: number;
  color: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

// ─── Task ────────────────────────────────────────────
export interface Task {
  _id: string;
  title: string;
  description?: string;
  column: string | Column;
  board: string;
  project: string;
  swimlane?: string;
  assignee?: User;
  creator: User;
  position: number;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  status: 'open' | 'in_progress' | 'completed' | 'archived';
  timeEstimated: number;
  timeSpent: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Subtask ─────────────────────────────────────────
export interface Subtask {
  _id: string;
  task: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  assignee?: User;
  position: number;
  timeSpent: number;
}

// ─── Comment ─────────────────────────────────────────
export interface Comment {
  _id: string;
  task: string;
  user: User;
  content: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Attachment ──────────────────────────────────────
export interface Attachment {
  _id: string;
  task: string;
  user: User;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// ─── Swimlane ────────────────────────────────────────
export interface Swimlane {
  _id: string;
  board: string;
  name: string;
  position: number;
  isActive: boolean;
}

// ─── Activity Log ────────────────────────────────────
export interface ActivityLog {
  _id: string;
  project: string;
  task?: { _id: string; title: string };
  user: User;
  action: string;
  details: Record<string, any>;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Auth ────────────────────────────────────────────
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}
```

---

## 4. API Layer & State Management

### 4.1 Axios Instance (`client/lib/api.ts`)

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' && 
        !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 4.2 Auth Store (`client/store/authStore.ts`)

```typescript
import { create } from 'zustand';
import api from '@/lib/api';
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login:    (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout:   () => Promise<void>;
  fetchMe:  () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (payload) => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (payload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { data } = await api.put('/users/profile', updates);
    set({ user: data.user });
  },
}));
```

### 4.3 Board Store (`client/store/boardStore.ts`)

```typescript
import { create } from 'zustand';
import api from '@/lib/api';
import type { BoardData, Task, Column, ColumnWithTasks } from '@/types';

interface BoardState {
  boardData: BoardData | null;
  isLoading: boolean;
  error: string | null;

  fetchBoard:  (boardId: string) => Promise<void>;
  moveTask:    (taskId: string, targetColumn: string, targetPosition: number) => Promise<void>;
  addTask:     (data: Partial<Task>) => Promise<Task>;
  updateTask:  (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask:  (taskId: string) => Promise<void>;
  addColumn:   (data: Partial<Column>) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (columns: { id: string; position: number }[]) => Promise<void>;
  
  // Optimistic update helper
  optimisticMoveTask: (taskId: string, sourceColId: string, destColId: string, destIndex: number) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boardData: null,
  isLoading: false,
  error: null,

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      set({ boardData: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load board', isLoading: false });
    }
  },

  // Optimistic move — update UI immediately before API call
  optimisticMoveTask: (taskId, sourceColId, destColId, destIndex) => {
    const { boardData } = get();
    if (!boardData) return;

    const newColumns = boardData.columns.map(col => ({
      ...col,
      tasks: [...col.tasks],
    }));

    // Find and remove task from source
    const sourceCol = newColumns.find(c => c._id === sourceColId)!;
    const taskIndex = sourceCol.tasks.findIndex(t => t._id === taskId);
    const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

    // Insert into destination
    const destCol = newColumns.find(c => c._id === destColId)!;
    movedTask.column = destColId;
    destCol.tasks.splice(destIndex, 0, movedTask);

    // Update positions
    sourceCol.tasks.forEach((t, i) => { t.position = i; });
    destCol.tasks.forEach((t, i) => { t.position = i; });

    set({ boardData: { ...boardData, columns: newColumns } });
  },

  moveTask: async (taskId, targetColumn, targetPosition) => {
    try {
      await api.patch(`/tasks/${taskId}/move`, { targetColumn, targetPosition });
    } catch (err: any) {
      // Revert on failure — refetch board
      const { boardData } = get();
      if (boardData) get().fetchBoard(boardData.board._id);
    }
  },

  addTask: async (data) => {
    const { data: task } = await api.post('/tasks', data);
    // Refetch board to get updated positions
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id);
    return task;
  },

  updateTask: async (taskId, updates) => {
    await api.put(`/tasks/${taskId}`, updates);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id);
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id);
  },

  addColumn: async (data) => {
    await api.post('/columns', data);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id);
  },

  updateColumn: async (columnId, updates) => {
    await api.put(`/columns/${columnId}`, updates);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id);
  },

  deleteColumn: async (columnId) => {
    await api.delete(`/columns/${columnId}`);
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id);
  },

  reorderColumns: async (columns) => {
    await api.patch('/columns/reorder', { columns });
    const { boardData } = get();
    if (boardData) await get().fetchBoard(boardData.board._id);
  },
}));
```

### 4.4 Notification Store (`client/store/notificationStore.ts`)

```typescript
import { create } from 'zustand';
import api from '@/lib/api';

export interface AppNotification {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const { data } = await api.get('/notifications');
    set({
      notifications: data.notifications,
      unreadCount: data.notifications.filter((n: AppNotification) => !n.isRead).length,
    });
  },

  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.patch('/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
```

---

## 5. Page Structure & Routing

### 5.1 App Router Layout

```
app/
├── layout.tsx                    # Root layout: fonts, Toaster, AuthProvider
├── globals.css
│
├── (auth)/                       # Public routes (no sidebar)
│   ├── layout.tsx                # Centered card layout
│   ├── login/
│   │   └── page.tsx              # Login form
│   └── register/
│       └── page.tsx              # Registration form
│
├── (dashboard)/                  # Protected routes (sidebar + header)
│   ├── layout.tsx                # Sidebar, Header, auth guard
│   ├── page.tsx                  # Dashboard home (project list + stats)
│   │
│   ├── projects/
│   │   ├── page.tsx              # All projects grid/list
│   │   ├── new/
│   │   │   └── page.tsx          # Create project form
│   │   └── [projectId]/
│   │       ├── page.tsx          # Project overview (boards list + activity)
│   │       ├── board/
│   │       │   └── [boardId]/
│   │       │       └── page.tsx  # ★ Kanban board view (main feature)
│   │       ├── analytics/
│   │       │   └── page.tsx      # Analytics dashboard (Phase 4)
│   │       ├── automation/
│   │       │   └── page.tsx      # Automation rules (Phase 4)
│   │       ├── members/
│   │       │   └── page.tsx      # Project members management
│   │       └── settings/
│   │           └── page.tsx      # Project settings
│   │
│   ├── notifications/
│   │   └── page.tsx              # Notification center (Phase 4)
│   │
│   └── admin/
│       ├── users/
│       │   └── page.tsx          # User management (admin only)
│       └── settings/
│           └── page.tsx          # System settings (admin only)
│
└── not-found.tsx                 # Custom 404
```

### 5.2 Root Layout (`client/app/layout.tsx`)

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kanboard',
  description: 'Kanban project management tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### 5.3 Auth Layout (`client/app/(auth)/layout.tsx`)

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  );
}
```

### 5.4 Dashboard Layout with Auth Guard (`client/app/(dashboard)/layout.tsx`)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 6. Core UI Components

### 6.1 Component Hierarchy

```
components/
├── ui/                           # Base design system
│   ├── Button.tsx                # Primary, secondary, danger, ghost, icon variants
│   ├── Input.tsx                 # Text, email, password with label + error
│   ├── Textarea.tsx              # Multiline input
│   ├── Select.tsx                # Dropdown select
│   ├── Modal.tsx                 # Dialog overlay (Radix-based)
│   ├── Dropdown.tsx              # Dropdown menu (Radix-based)
│   ├── Badge.tsx                 # Status/label badges
│   ├── Avatar.tsx                # User avatar with fallback
│   ├── Spinner.tsx               # Loading spinner
│   ├── Toaster.tsx               # Toast notifications
│   ├── EmptyState.tsx            # Empty data placeholder
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── Header.tsx                # Top bar with search + notifications + profile
│   └── ConfirmDialog.tsx         # Confirmation modal
│
├── board/                        # Kanban board
│   ├── KanbanBoard.tsx           # ★ Main board with DragDropContext
│   ├── KanbanColumn.tsx          # Single column (Droppable)
│   ├── TaskCard.tsx              # Task card in column (Draggable)
│   ├── AddColumnForm.tsx         # Inline column creation
│   ├── ColumnHeader.tsx          # Column title, WIP count, menu
│   └── BoardHeader.tsx           # Board title, filters, view options
│
├── task/                         # Task detail
│   ├── TaskDetailModal.tsx       # ★ Full task detail overlay
│   ├── TaskForm.tsx              # Create/edit task form
│   ├── TaskDescription.tsx       # Markdown editor + preview
│   ├── SubtaskList.tsx           # Subtask checklist
│   ├── CommentSection.tsx        # Comments thread
│   ├── CommentItem.tsx           # Single comment
│   ├── AttachmentList.tsx        # File attachments
│   ├── TimeTracker.tsx           # Time tracking widget
│   ├── TaskLabels.tsx            # Label/tag chips
│   ├── TaskAssignee.tsx          # Assignee selector
│   └── ActivityTimeline.tsx      # Task activity history
│
├── project/                      # Project views
│   ├── ProjectCard.tsx           # Project card for grid
│   ├── ProjectForm.tsx           # Create/edit project
│   ├── MemberList.tsx            # Project members list
│   └── AddMemberDialog.tsx       # Add member modal
│
├── analytics/                    # Charts (Phase 4 — placeholder)
├── automation/                   # Rules (Phase 4 — placeholder)
└── notifications/                # Notification center (Phase 4 — placeholder)
```

### 6.2 Sidebar Component (`client/components/ui/Sidebar.tsx`)

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, FolderKanban, Bell, Settings, Users, LogOut, ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard',     href: '/',                icon: LayoutDashboard },
  { name: 'Projects',      href: '/projects',        icon: FolderKanban },
  { name: 'Notifications', href: '/notifications',   icon: Bell },
];

const adminNav = [
  { name: 'Users',    href: '/admin/users',    icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 
                        flex flex-col transition-all duration-200`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        {!collapsed && <h1 className="text-xl font-bold text-primary-600">Kanboard</h1>}
        <button onClick={() => setCollapsed(!collapsed)}
                className="ml-auto p-1 rounded hover:bg-gray-100">
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.name} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin section */}
        {user?.role === 'admin' && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-gray-400 uppercase">Admin</p>
              </div>
            )}
            {adminNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.name} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors ${isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 p-4">
        <button onClick={logout}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm 
                           text-gray-600 hover:bg-gray-50">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
```

### 6.3 Header Component (`client/components/ui/Header.tsx`)

```typescript
'use client';

import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import Avatar from './Avatar';
import { useState } from 'react';

export default function Header() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100">
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs 
                           rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* User */}
      <div className="flex items-center gap-3">
        <Avatar name={user?.displayName || user?.username || ''} size="sm" />
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}
```

---

## 7. Kanban Board — Main Feature

### 7.1 KanbanBoard Component (`client/components/board/KanbanBoard.tsx`)

This is the **centerpiece** of the application — the drag-and-drop Kanban board.

```typescript
'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '@/store/boardStore';
import KanbanColumn from './KanbanColumn';
import AddColumnForm from './AddColumnForm';
import BoardHeader from './BoardHeader';
import TaskDetailModal from '../task/TaskDetailModal';
import Spinner from '../ui/Spinner';
import type { Task } from '@/types';

interface KanbanBoardProps {
  boardId: string;
  projectId: string;
}

export default function KanbanBoard({ boardId, projectId }: KanbanBoardProps) {
  const { boardData, isLoading, fetchBoard, optimisticMoveTask, moveTask } = useBoardStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchBoard(boardId);
  }, [boardId, fetchBoard]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside any droppable
    if (!destination) return;
    
    // Dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update
    optimisticMoveTask(draggableId, source.droppableId, destination.droppableId, destination.index);

    // API call
    await moveTask(draggableId, destination.droppableId, destination.index);
  };

  if (isLoading || !boardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <BoardHeader board={boardData.board} projectId={projectId} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 px-1">
          {boardData.columns.map((column) => (
            <KanbanColumn
              key={column._id}
              column={column}
              boardId={boardId}
              projectId={projectId}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ))}

          {/* Add column button */}
          <AddColumnForm boardId={boardId} />
        </div>
      </DragDropContext>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask._id}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
```

### 7.2 KanbanColumn Component (`client/components/board/KanbanColumn.tsx`)

```typescript
'use client';

import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import ColumnHeader from './ColumnHeader';
import type { ColumnWithTasks, Task } from '@/types';
import { useState } from 'react';
import TaskForm from '../task/TaskForm';

interface KanbanColumnProps {
  column: ColumnWithTasks;
  boardId: string;
  projectId: string;
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({ column, boardId, projectId, onTaskClick }: KanbanColumnProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const isOverLimit = column.taskLimit > 0 && column.tasks.length >= column.taskLimit;

  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-gray-50 rounded-xl">
      <ColumnHeader
        column={column}
        taskCount={column.tasks.length}
        isOverLimit={isOverLimit}
      />

      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] p-2 space-y-2 overflow-y-auto transition-colors
              ${snapshot.isDraggingOver ? 'bg-primary-50' : ''}`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task */}
      <div className="p-2">
        {showAddTask ? (
          <TaskForm
            columnId={column._id}
            boardId={boardId}
            projectId={projectId}
            onClose={() => setShowAddTask(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            disabled={isOverLimit}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100
                       rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
```

### 7.3 TaskCard Component (`client/components/board/TaskCard.tsx`)

```typescript
'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Clock, MessageSquare, Paperclip } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import type { Task } from '@/types';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg p-3 shadow-card border border-gray-100 cursor-pointer
            hover:shadow-card-hover transition-shadow group
            ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
            ${task.color !== '#ffffff' ? 'border-l-4' : ''}`}
          style={{
            ...provided.draggableProps.style,
            borderLeftColor: task.color !== '#ffffff' ? task.color : undefined,
          }}
        >
          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label, i) => (
                <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {task.title}
          </h4>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority */}
            <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs
                ${isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-gray-500'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {/* Time tracking */}
            {task.timeSpent > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {Math.round(task.timeSpent / 60)}h
              </span>
            )}
          </div>

          {/* Footer: assignee */}
          {task.assignee && (
            <div className="flex items-center justify-end mt-2">
              <Avatar
                name={task.assignee.displayName || task.assignee.username}
                size="xs"
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
```

---

## 8. Task Detail Modal

### 8.1 TaskDetailModal (`client/components/task/TaskDetailModal.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, Calendar, User, Tag, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useBoardStore } from '@/store/boardStore';
import TaskDescription from './TaskDescription';
import SubtaskList from './SubtaskList';
import CommentSection from './CommentSection';
import AttachmentList from './AttachmentList';
import TimeTracker from './TimeTracker';
import ActivityTimeline from './ActivityTimeline';
import type { Task, Subtask, Comment, Attachment } from '@/types';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { updateTask, deleteTask } = useBoardStore();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  useEffect(() => {
    const fetchAll = async () => {
      const [taskRes, subtaskRes, commentRes, attachmentRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/subtasks/task/${taskId}`),
        api.get(`/comments/task/${taskId}`),
        api.get(`/attachments/task/${taskId}`),
      ]);
      setTask(taskRes.data);
      setSubtasks(subtaskRes.data);
      setComments(commentRes.data);
      setAttachments(attachmentRes.data);
    };
    fetchAll();
  }, [taskId]);

  if (!task) return null;

  const handleUpdate = async (field: string, value: any) => {
    await updateTask(taskId, { [field]: value });
    setTask({ ...task, [field]: value });
  };

  const handleDelete = async () => {
    if (confirm('Delete this task? This cannot be undone.')) {
      await deleteTask(taskId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] 
                      overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <input
            type="text"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            onBlur={() => handleUpdate('title', task.title)}
            className="text-lg font-semibold text-gray-900 bg-transparent border-none 
                       focus:outline-none focus:ring-0 flex-1"
          />
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* Left: Main content (2/3) */}
            <div className="col-span-2 space-y-6">
              {/* Description */}
              <TaskDescription
                content={task.description || ''}
                onSave={(content) => handleUpdate('description', content)}
              />

              {/* Subtasks */}
              <SubtaskList taskId={taskId} subtasks={subtasks} onChange={setSubtasks} />

              {/* Tabs: Comments / Activity */}
              <div>
                <div className="flex gap-4 border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === 'details'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-2 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === 'activity'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Activity
                  </button>
                </div>

                {activeTab === 'details' ? (
                  <CommentSection taskId={taskId} comments={comments} onChange={setComments} />
                ) : (
                  <ActivityTimeline taskId={taskId} />
                )}
              </div>
            </div>

            {/* Right: Sidebar metadata (1/3) */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdate('status', e.target.value)}
                  className="input-field mt-1"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
                <select
                  value={task.priority}
                  onChange={(e) => handleUpdate('priority', e.target.value)}
                  className="input-field mt-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Assignee</label>
                {/* TaskAssignee component would handle user selection */}
                <p className="text-sm mt-1">
                  {task.assignee ? task.assignee.displayName : 'Unassigned'}
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Due Date</label>
                <input
                  type="date"
                  value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdate('dueDate', e.target.value || null)}
                  className="input-field mt-1"
                />
              </div>

              {/* Time Tracking */}
              <TimeTracker
                estimated={task.timeEstimated}
                spent={task.timeSpent}
                onLogTime={(minutes) => handleUpdate('timeSpent', task.timeSpent + minutes)}
              />

              {/* Labels */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Labels</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.labels.map((label, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-gray-100 rounded-full">{label}</span>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <AttachmentList taskId={taskId} attachments={attachments} onChange={setAttachments} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 9. Login & Register Pages

### 9.1 Login Page (`client/app/(auth)/login/page.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your Kanboard account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 text-danger-600 text-sm rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                 required className="input-field" placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                 required className="input-field" placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading}
                className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
```

---

## 10. Dashboard Page

### 10.1 Dashboard Home (`client/app/(dashboard)/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProjectCard from '@/components/project/ProjectCard';
import { Plus, FolderKanban, CheckCircle2, Clock } from 'lucide-react';
import type { Project, ActivityLog } from '@/types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({ totalProjects: 0, totalTasks: 0, completedTasks: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const [projectsRes] = await Promise.all([
        api.get('/projects'),
      ]);
      setProjects(projectsRes.data);
      setStats({
        totalProjects: projectsRes.data.length,
        totalTasks: 0,       // Could aggregate from API
        completedTasks: 0,
      });
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            <FolderKanban className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            <p className="text-sm text-gray-500">Active Projects</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-warning-50 rounded-lg">
            <Clock className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            <p className="text-sm text-gray-500">Open Tasks</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-success-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            <p className="text-sm text-gray-500">Completed Tasks</p>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
          <Link href="/projects/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-medium mb-1">No projects yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first project to get started</p>
            <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 11. Board Page (Kanban View)

### 11.1 Board Page (`client/app/(dashboard)/projects/[projectId]/board/[boardId]/page.tsx`)

```typescript
'use client';

import { useParams } from 'next/navigation';
import KanbanBoard from '@/components/board/KanbanBoard';

export default function BoardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const boardId = params.boardId as string;

  return (
    <div className="h-[calc(100vh-8rem)]">
      <KanbanBoard boardId={boardId} projectId={projectId} />
    </div>
  );
}
```

---

## 12. Reusable UI Components

### 12.1 Avatar (`client/components/ui/Avatar.tsx`)

```typescript
interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
];

export default function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  }

  return (
    <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center 
                     justify-center text-white font-medium`}
         title={name}>
      {initials}
    </div>
  );
}
```

### 12.2 Badge (`client/components/ui/Badge.tsx`)

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
};

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

### 12.3 Modal (`client/components/ui/Modal.tsx`)

```typescript
'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl ${sizeMap[size]} w-full max-h-[85vh] 
                       overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

---

## 13. Feature Implementation Details

### 13.1 Markdown Editor for Task Description

```typescript
// client/components/task/TaskDescription.tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TaskDescriptionProps {
  content: string;
  onSave: (content: string) => void;
}

export default function TaskDescription({ content, onSave }: TaskDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="input-field min-h-[150px] font-mono text-sm"
          placeholder="Write a description (Markdown supported)..."
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-primary text-sm">Save</button>
          <button onClick={() => { setDraft(content); setIsEditing(false); }} 
                  className="btn-secondary text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <button onClick={() => setIsEditing(true)} className="text-xs text-primary-600 hover:underline">
          Edit
        </button>
      </div>
      {content ? (
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-gray-400 cursor-pointer hover:text-gray-600"
           onClick={() => setIsEditing(true)}>
          Click to add a description...
        </p>
      )}
    </div>
  );
}
```

### 13.2 Subtask List

```typescript
// client/components/task/SubtaskList.tsx
'use client';

import { useState } from 'react';
import { Plus, Check, Circle, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import type { Subtask } from '@/types';

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export default function SubtaskList({ taskId, subtasks, onChange }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('');

  const completedCount = subtasks.filter(s => s.status === 'done').length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  const addSubtask = async () => {
    if (!newTitle.trim()) return;
    const { data } = await api.post('/subtasks', { task: taskId, title: newTitle.trim() });
    onChange([...subtasks, data]);
    setNewTitle('');
  };

  const toggleSubtask = async (subtask: Subtask) => {
    const newStatus = subtask.status === 'done' ? 'todo' : 'done';
    await api.patch(`/subtasks/${subtask._id}/status`, { status: newStatus });
    onChange(subtasks.map(s => s._id === subtask._id ? { ...s, status: newStatus } : s));
  };

  const deleteSubtask = async (id: string) => {
    await api.delete(`/subtasks/${id}`);
    onChange(subtasks.filter(s => s._id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Subtasks ({completedCount}/{subtasks.length})
        </label>
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-success-500 rounded-full transition-all duration-300"
               style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Subtask items */}
      <div className="space-y-1 mb-2">
        {subtasks.map(subtask => (
          <div key={subtask._id} className="flex items-center gap-2 group py-1">
            <button onClick={() => toggleSubtask(subtask)} className="flex-shrink-0">
              {subtask.status === 'done' ? (
                <Check className="w-4 h-4 text-success-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
            </button>
            <span className={`flex-1 text-sm ${subtask.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {subtask.title}
            </span>
            <button onClick={() => deleteSubtask(subtask._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add subtask */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
          className="input-field flex-1 text-sm"
          placeholder="Add a subtask..."
        />
        <button onClick={addSubtask} className="btn-secondary p-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

---

## 14. Deliverables Checklist

| # | Deliverable | Status |
|---|------------|--------|
| 1 | Next.js 14 project with App Router, Tailwind, TypeScript | ☐ |
| 2 | TypeScript interfaces for all data types | ☐ |
| 3 | Axios API layer with token interceptors | ☐ |
| 4 | Zustand stores (auth, board, notification) | ☐ |
| 5 | Auth pages (login, register) | ☐ |
| 6 | Dashboard layout (sidebar, header, auth guard) | ☐ |
| 7 | Dashboard home (project grid, stats) | ☐ |
| 8 | Project CRUD pages (list, create, settings, members) | ☐ |
| 9 | Kanban board with drag-and-drop | ☐ |
| 10 | Task detail modal (description, subtasks, comments, attachments, time tracking) | ☐ |
| 11 | Column management (add, rename, delete, reorder, WIP limits) | ☐ |
| 12 | Swimlane support | ☐ |
| 13 | User management admin panel | ☐ |
| 14 | Task search & filter | ☐ |
| 15 | Responsive design (mobile, tablet, desktop) | ☐ |
| 16 | Reusable component library (Button, Modal, Avatar, Badge, etc.) | ☐ |

---

## 15. Week-by-Week Schedule

| Week | Focus | Key Output |
|------|-------|-----------|
| **Week 7** | Next.js setup, auth pages, dashboard layout, sidebar/header, project CRUD, Zustand stores, API layer | Working auth flow, dashboard with project list |
| **Week 8** | Kanban board (drag-and-drop), task cards, task detail modal (subtasks, comments, attachments, time tracking), column management, search/filter | Fully interactive Kanban board connected to API |

---

## 16. Risks and Mitigation

| Risk | Mitigation |
|------|-----------|
| Drag-and-drop performance with 100+ tasks | Use virtualized lists for large boards; optimize re-renders with `React.memo` |
| State management complexity | Keep stores focused (one per domain); avoid over-centralizing |
| Optimistic UI out of sync with server | Always refetch after failed API calls; use error boundaries |
| Auth token race conditions | Queue requests during token refresh; use axios interceptor pattern |
| Responsive Kanban layout on mobile | Horizontal scroll for columns; consider list view alternative for small screens |

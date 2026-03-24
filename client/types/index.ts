// ─── User ────────────────────────────────────────────
export interface NotificationPreferences {
  email:      boolean;
  inApp:      boolean;
  digest:     'none' | 'daily' | 'weekly';
  webhookUrl?: string;
}

export interface User {
  _id:          string;
  username:     string;
  email:        string;
  role:         'admin' | 'manager' | 'user';
  displayName:  string;
  avatar?:      string;
  isActive:     boolean;
  notificationPreferences: NotificationPreferences;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Auth ────────────────────────────────────────────
export interface AuthResponse {
  user:         User;
  accessToken:  string;
  refreshToken: string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  username:     string;
  email:        string;
  password:     string;
  displayName?: string;
}

// ─── Project ─────────────────────────────────────────
export interface ProjectMember {
  user: User;
  role: 'manager' | 'member';
}

export interface Project {
  _id:          string;
  name:         string;
  description?: string;
  owner:        User;
  members:      ProjectMember[];
  isArchived:   boolean;
  color:        string;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Board ───────────────────────────────────────────
export interface Board {
  _id:          string;
  project:      string | Project;
  name:         string;
  description?: string;
  isActive:     boolean;
  createdAt:    string;
}

export interface BoardData {
  board:     Board;
  columns:   ColumnWithTasks[];
  swimlanes: Swimlane[];
}

// ─── Column ──────────────────────────────────────────
export interface Column {
  _id:       string;
  board:     string;
  title:     string;
  position:  number;
  taskLimit: number;
  color:     string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

// ─── Swimlane ────────────────────────────────────────
export interface Swimlane {
  _id:      string;
  board:    string;
  name:     string;
  position: number;
  isActive: boolean;
}

// ─── Task ────────────────────────────────────────────
export interface Task {
  _id:           string;
  title:         string;
  description?:  string;
  column:        string | Column;
  board:         string;
  project:       string;
  swimlane?:     string;
  assignee?:     User;
  creator:       User;
  position:      number;
  color:         string;
  priority:      'low' | 'medium' | 'high' | 'urgent';
  dueDate?:      string;
  startDate?:    string;
  completedAt?:  string;
  status:        'open' | 'in_progress' | 'completed' | 'archived';
  timeEstimated: number;  // minutes
  timeSpent:     number;  // minutes
  labels:        string[];
  createdAt:     string;
  updatedAt:     string;
}

// ─── Subtask ─────────────────────────────────────────
export interface Subtask {
  _id:       string;
  task:      string;
  title:     string;
  status:    'todo' | 'in_progress' | 'done';
  assignee?: User;
  position:  number;
  timeSpent: number;
}

// ─── Comment ─────────────────────────────────────────
export interface Comment {
  _id:       string;
  task:      string;
  user:      User;
  content:   string;
  mentions:  string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Attachment ──────────────────────────────────────
export interface Attachment {
  _id:          string;
  task:         string;
  user:         User;
  filename:     string;
  originalName: string;
  mimeType:     string;
  size:         number;
  createdAt:    string;
}

// ─── Activity Log ────────────────────────────────────
export interface ActivityLog {
  _id:      string;
  project:  string;
  task?:    { _id: string; title: string };
  user:     User;
  action:   string;
  details:  Record<string, unknown>;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page:  number;
    limit: number;
    total: number;
    pages: number;
  };
}

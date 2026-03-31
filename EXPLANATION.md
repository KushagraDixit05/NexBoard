# NexBoard - Complete Project Explanation

> **Project Type:** Full-Stack Kanban Project Management Platform  
> **Development Period:** March 2026  
> **Developer:** Kushagra Dixit  
> **Purpose:** College Project / Software Engineering Lab  

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technical Architecture](#technical-architecture)
4. [Tech Stack Details](#tech-stack-details)
5. [Database Design](#database-design)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Key Features](#key-features)
9. [Authentication & Security](#authentication--security)
10. [API Design](#api-design)
11. [State Management](#state-management)
12. [Deployment Architecture](#deployment-architecture)
13. [Challenges & Solutions](#challenges--solutions)
14. [Future Enhancements](#future-enhancements)

---

## 1. Executive Summary

**NexBoard** is a modern, full-stack Kanban project management application inspired by Kanboard but rebuilt using cutting-edge web technologies. It enables teams to manage projects, tasks, and workflows using an intuitive drag-and-drop interface.

### Key Statistics:
- **Lines of Code:** ~15,000+ (Frontend: ~8,000, Backend: ~7,000)
- **Components:** 52+ React components
- **API Endpoints:** 50+ RESTful endpoints
- **Database Collections:** 14 MongoDB collections
- **Build Time:** ~30-45 seconds
- **Tech Stack:** MERN (MongoDB, Express, React/Next.js, Node.js) + TypeScript

### Why This Project?

This project demonstrates:
- Full-stack development skills
- Modern web architecture patterns
- Database design and optimization
- RESTful API design
- Authentication and authorization
- Real-time UI interactions
- Production deployment

---

## 2. Project Overview

### 2.1 What is NexBoard?

NexBoard is a Kanban-style project management tool that helps teams:
- **Organize** work into projects and boards
- **Track** tasks through different stages (columns)
- **Collaborate** with team members
- **Visualize** workflow with drag-and-drop boards
- **Monitor** project analytics and metrics
- **Automate** repetitive tasks with rules

### 2.2 Problem Statement

Traditional project management tools are either:
- **Too complex** for small teams (Jira, Asana)
- **Too simple** for serious work (Trello)
- **Expensive** for startups and students
- **Outdated** tech stack (PHP-based Kanboard)

**NexBoard solves this** by providing a modern, lightweight, feature-rich alternative.

### 2.3 Target Users

- **Software Development Teams**: Track sprints and bugs
- **Content Teams**: Manage editorial calendars
- **Students**: Organize group projects
- **Freelancers**: Manage client work
- **Startups**: MVP project tracking

---

## 3. Technical Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│  Next.js 14 App Router + React 18 + TypeScript          │
│  - Pages (App Router)                                   │
│  - Components (52+)                                     │
│  - Zustand Store (State Management)                     │
│  - Axios (HTTP Client)                                  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API
                     │ (JSON over HTTP)
┌────────────────────▼────────────────────────────────────┐
│                   SERVER (Node.js)                      │
│  Express.js 4.x REST API                                │
│  - Routes (11 routers)                                  │
│  - Controllers (11 controllers)                         │
│  - Middleware (Auth, RBAC, Validation)                  │
│  - Services (Business Logic)                            │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
                     │ (MongoDB Driver)
┌────────────────────▼────────────────────────────────────┐
│                  DATABASE (MongoDB)                     │
│  NoSQL Document Database                                │
│  - Users, Projects, Boards, Tasks, etc.                 │
│  - Indexes for performance                              │
│  - Relationships via ObjectId references                │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Design Patterns Used

1. **MVC (Model-View-Controller)**
   - Models: Mongoose schemas
   - Views: React components
   - Controllers: Express route handlers

2. **Repository Pattern**
   - Services layer abstracts database operations
   - Controllers use services, not direct DB calls

3. **Middleware Chain**
   - Request → Auth → Validation → Controller → Response

4. **Component Composition**
   - Small, reusable React components
   - Container/Presentation pattern

5. **Store Pattern**
   - Zustand for centralized state management
   - Separation of UI state and API data

### 3.3 Project Structure

```
nexboard/
├── client/                     # Frontend (Next.js 14)
│   ├── app/                    # App Router pages
│   │   ├── (auth)/            # Auth pages (login, callback)
│   │   ├── dashboard/         # Main app pages
│   │   │   ├── projects/
│   │   │   ├── admin/
│   │   │   └── settings/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components (52+)
│   │   ├── ui/                # Base UI components
│   │   ├── board/             # Kanban board components
│   │   ├── task/              # Task components
│   │   ├── project/           # Project components
│   │   └── analytics/         # Chart components
│   ├── lib/                   # Utilities
│   │   ├── api.ts            # Axios instance
│   │   └── utils.ts          # Helper functions
│   ├── store/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── boardStore.ts
│   │   └── notificationStore.ts
│   ├── types/                 # TypeScript interfaces
│   └── package.json
│
├── server/                    # Backend (Express.js)
│   ├── src/
│   │   ├── models/           # Mongoose models (14)
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Board.js
│   │   │   ├── Task.js
│   │   │   └── ... (10 more)
│   │   ├── routes/           # Express routers
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth, validation, etc.
│   │   ├── services/         # Reusable services
│   │   ├── validators/       # Zod schemas
│   │   ├── config/           # Configuration
│   │   └── app.js           # Express app setup
│   ├── index.js              # Server entry point
│   └── package.json
│
├── Documentation/             # Project docs
├── docker-compose.yml        # Docker setup
└── package.json              # Root workspace
```

---

## 4. Tech Stack Details

### 4.1 Frontend Technologies

#### **Next.js 14 (App Router)**
- **Why?** Server-side rendering, file-based routing, API routes, optimizations
- **Features Used:**
  - App Router for modern routing
  - Server Components for performance
  - Image optimization
  - Dynamic imports for code splitting
  - Route groups for authentication

#### **React 18**
- **Why?** Component-based architecture, virtual DOM, hooks
- **Features Used:**
  - Functional components with hooks
  - useEffect for data fetching
  - useState for local state
  - Custom hooks (useAuth, useBoard)
  - Context API (not heavily used due to Zustand)

#### **TypeScript**
- **Why?** Type safety, better IDE support, fewer runtime errors
- **Usage:**
  - Interfaces for all data models
  - Type-safe API calls
  - Component prop types
  - ~90% type coverage

#### **Tailwind CSS**
- **Why?** Utility-first, rapid prototyping, consistent design
- **Features:**
  - Custom color palette
  - Responsive design utilities
  - Dark mode support (implemented)
  - Component classes for reusability

#### **Zustand**
- **Why?** Simpler than Redux, better than Context API for complex state
- **Stores:**
  - authStore: User authentication state
  - boardStore: Current board data
  - notificationStore: App notifications

#### **@hello-pangea/dnd**
- **Why?** Best React drag-and-drop library (react-beautiful-dnd fork)
- **Usage:** Drag tasks between columns on Kanban board

#### **Axios**
- **Why?** Better than fetch, interceptors, request/response transformation
- **Configuration:**
  - Base URL configuration
  - JWT token auto-injection
  - Error handling interceptors

#### **Recharts**
- **Why?** React-native charts library for analytics
- **Charts Used:**
  - Bar charts for task distribution
  - Line charts for trends
  - Pie charts for completion rates

### 4.2 Backend Technologies

#### **Node.js 18+**
- **Why?** JavaScript everywhere, large ecosystem, async I/O
- **Features Used:**
  - ES6+ syntax
  - Async/await
  - Event emitters
  - File system operations

#### **Express.js 4.x**
- **Why?** Minimal, flexible, mature, large community
- **Middleware Stack:**
  1. helmet (security headers)
  2. cors (cross-origin requests)
  3. morgan (request logging)
  4. express.json (JSON parsing)
  5. cookieParser (cookie handling)
  6. rateLimiter (DOS protection)
  7. auth middleware (JWT verification)
  8. role middleware (RBAC)

#### **MongoDB 7.x**
- **Why?** Flexible schema, JSON documents, scalability
- **Features:**
  - Embedded documents for related data
  - References for relationships
  - Indexes for query performance
  - Aggregation pipelines for analytics

#### **Mongoose 8.x**
- **Why?** Schema validation, middleware, query building
- **Features:**
  - Schema definitions with validation
  - Virtual properties
  - Pre/post hooks
  - Population (joins)
  - Timestamps

#### **JWT (jsonwebtoken)**
- **Why?** Stateless authentication, scalable
- **Implementation:**
  - Access tokens (24h expiry)
  - Refresh tokens (7d expiry)
  - Token rotation on refresh
  - Secure cookie storage

#### **bcryptjs**
- **Why?** Secure password hashing
- **Usage:**
  - 10 salt rounds
  - Pre-save hook on User model
  - Compare method for login

#### **Passport.js**
- **Why?** OAuth integration
- **Strategies:**
  - passport-google-oauth20 (Google login)
  - passport-github2 (GitHub login)

#### **Zod**
- **Why?** Schema validation, TypeScript inference
- **Usage:**
  - Request body validation
  - Query parameter validation
  - Type-safe validation errors

#### **Multer**
- **Why?** File upload handling
- **Configuration:**
  - Max file size: 10MB
  - Allowed types: images, PDFs, docs
  - Unique filenames with UUID

#### **Nodemailer**
- **Why?** Email sending (optional feature)
- **Usage:**
  - Password reset emails
  - Notification digests
  - SMTP configuration

#### **node-cron**
- **Why?** Scheduled tasks
- **Jobs:**
  - Automation rule execution
  - Recurring task creation
  - Notification digests

---

## 5. Database Design

### 5.1 Collections Overview

| Collection | Documents | Purpose | Relationships |
|------------|-----------|---------|---------------|
| users | ~100 | User accounts | - |
| projects | ~20 | Projects | owner → users |
| boards | ~30 | Kanban boards | project → projects |
| columns | ~150 | Board columns | board → boards |
| tasks | ~500 | Tasks/cards | column, board, project |
| subtasks | ~200 | Task checklist items | task → tasks |
| comments | ~300 | Task comments | task, author → users |
| attachments | ~100 | File uploads | task → tasks |
| swimlanes | ~50 | Horizontal grouping | board → boards |
| taskDependencies | ~50 | Task relationships | task, dependsOn → tasks |
| customFields | ~30 | Custom task fields | project → projects |
| activityLogs | ~1000+ | Audit trail | project, user |
| notifications | ~500+ | User notifications | user → users |
| automationRules | ~20 | Automation rules | project → projects |

### 5.2 Key Schemas

#### **User Schema**
```javascript
{
  _id: ObjectId,
  username: String (unique, required, 3-30 chars),
  email: String (unique, required, valid email),
  password: String (hashed, min 6 chars),
  displayName: String,
  avatar: String (URL),
  role: String (enum: ['user', 'manager', 'admin']),
  isActive: Boolean (default: true),
  provider: String (enum: ['local', 'google', 'github']),
  providerId: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- username (unique)
- email (unique)
- role (for admin queries)

#### **Project Schema**
```javascript
{
  _id: ObjectId,
  name: String (required, 3-100 chars),
  description: String,
  owner: ObjectId → User (required),
  members: [{ 
    user: ObjectId → User,
    role: String (enum: ['owner', 'admin', 'member', 'viewer']),
    addedAt: Date 
  }],
  isArchived: Boolean (default: false),
  settings: {
    taskPrefix: String (default: 'TASK'),
    allowPublicBoards: Boolean (default: false)
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- owner
- members.user
- isArchived

#### **Board Schema**
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  project: ObjectId → Project (required),
  color: String (hex color, default: '#3b82f6'),
  isDefault: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Task Schema**
```javascript
{
  _id: ObjectId,
  title: String (required, 3-200 chars),
  description: String (Markdown),
  board: ObjectId → Board (required),
  column: ObjectId → Column (required),
  project: ObjectId → Project (required),
  assignee: ObjectId → User,
  reporter: ObjectId → User (required),
  swimlane: ObjectId → Swimlane,
  
  priority: String (enum: ['low', 'medium', 'high', 'critical']),
  status: String (enum: ['open', 'in_progress', 'completed']),
  
  position: Number (for ordering within column),
  taskNumber: Number (auto-increment per project),
  
  dueDate: Date,
  startDate: Date,
  completedAt: Date,
  
  timeEstimate: Number (hours),
  timeSpent: Number (hours),
  
  tags: [String],
  color: String (hex color),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- board, column (compound) - for board queries
- project, taskNumber (compound, unique) - for task IDs
- assignee - for user task lists
- dueDate - for deadline queries

#### **Comment Schema**
```javascript
{
  _id: ObjectId,
  task: ObjectId → Task (required),
  author: ObjectId → User (required),
  content: String (Markdown, required),
  mentions: [ObjectId → User],
  isEdited: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.3 Data Relationships

```
User (1) ─── owns ──→ (N) Project
User (N) ←── member ─→ (N) Project (many-to-many)
Project (1) ─── has ──→ (N) Board
Board (1) ─── has ──→ (N) Column
Column (1) ─── has ──→ (N) Task
Task (1) ─── has ──→ (N) Subtask
Task (1) ─── has ──→ (N) Comment
Task (1) ─── has ──→ (N) Attachment
Task (N) ←── depends ─→ (N) Task (self-referential)
```

### 5.4 Database Optimizations

1. **Indexes:**
   - Compound indexes on frequently queried fields
   - Unique indexes on usernames, emails
   - Sparse indexes on optional fields

2. **Embedded vs Referenced:**
   - **Embedded:** Task subtasks (frequently accessed together)
   - **Referenced:** Task assignee (user data changes independently)

3. **Pagination:**
   - Limit queries to 50 documents
   - Skip/limit for page navigation
   - Cursor-based pagination for large datasets

4. **Aggregation Pipelines:**
   - Used in analytics for complex queries
   - Group by project, board, user
   - Calculate completion rates, averages

---

## 6. Backend Implementation

### 6.1 Server Architecture

**Layers:**
1. **Routes** → Define endpoints
2. **Middleware** → Auth, validation
3. **Controllers** → Handle requests
4. **Services** → Business logic
5. **Models** → Database interaction

### 6.2 Key Endpoints

#### **Authentication**
```
POST   /api/auth/register        - Create account
POST   /api/auth/login           - Login with email/password
POST   /api/auth/refresh         - Refresh access token
POST   /api/auth/logout          - Logout
GET    /api/auth/google          - Google OAuth
GET    /api/auth/github          - GitHub OAuth
GET    /api/auth/callback        - OAuth callback
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
```

#### **Projects**
```
GET    /api/projects             - List user projects
POST   /api/projects             - Create project
GET    /api/projects/:id         - Get project details
PATCH  /api/projects/:id         - Update project
DELETE /api/projects/:id         - Delete project
POST   /api/projects/:id/members - Add member
DELETE /api/projects/:id/members/:userId - Remove member
PATCH  /api/projects/:id/archive - Archive project
```

#### **Boards**
```
GET    /api/boards               - List boards (by project)
POST   /api/boards               - Create board
GET    /api/boards/:id           - Get board with columns & tasks
PATCH  /api/boards/:id           - Update board
DELETE /api/boards/:id           - Delete board
```

#### **Tasks**
```
GET    /api/tasks                - List tasks (with filters)
POST   /api/tasks                - Create task
GET    /api/tasks/:id            - Get task details
PATCH  /api/tasks/:id            - Update task
DELETE /api/tasks/:id            - Delete task
PATCH  /api/tasks/:id/move       - Move task to column
PATCH  /api/tasks/:id/assign     - Assign to user
POST   /api/tasks/:id/comments   - Add comment
POST   /api/tasks/:id/attachments - Upload file
```

### 6.3 Middleware Pipeline

**Request Flow:**
```
Request
  ↓
helmet() - Security headers
  ↓
cors() - CORS handling
  ↓
morgan() - Request logging
  ↓
express.json() - Parse JSON body
  ↓
rateLimiter() - Rate limit check
  ↓
authenticate() - Verify JWT token
  ↓
authorize(['admin']) - Check role
  ↓
validateBody(schema) - Zod validation
  ↓
Controller function
  ↓
Response / errorHandler()
```

### 6.4 Authentication Flow

**Login:**
```
1. User submits email + password
2. Server finds user by email
3. bcrypt.compare(password, hashedPassword)
4. Generate JWT access token (24h)
5. Generate JWT refresh token (7d)
6. Return both tokens + user data
```

**JWT Structure:**
```javascript
{
  header: {
    alg: 'HS256',
    typ: 'JWT'
  },
  payload: {
    userId: '507f1f77bcf86cd799439011',
    role: 'user',
    iat: 1678901234,
    exp: 1678987634
  },
  signature: '...'
}
```

**Protected Route:**
```
1. Client sends request with Authorization: Bearer <token>
2. Middleware extracts token
3. jwt.verify(token, secret)
4. If valid, attach user to req.user
5. Continue to controller
6. If invalid, return 401 Unauthorized
```

### 6.5 Role-Based Access Control (RBAC)

**Roles:**
- **Admin:** Full system access, user management
- **Manager:** Create projects, manage team
- **User:** Create tasks, comment, view assigned work
- **Viewer:** Read-only access (project member)

**Permission Matrix:**

| Action | User | Manager | Admin |
|--------|------|---------|-------|
| View own tasks | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Edit own tasks | ✅ | ✅ | ✅ |
| Edit any task | ❌ | ✅ | ✅ |
| Delete tasks | ❌ | ✅ | ✅ |
| Create projects | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View analytics | ✅ | ✅ | ✅ |

**Implementation:**
```javascript
// Middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage in route
router.delete('/users/:id', 
  authenticate, 
  authorize(['admin']), 
  userController.deleteUser
);
```

### 6.6 Error Handling

**Custom Error Classes:**
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Not authenticated') {
    super(message, 401);
  }
}
```

**Global Error Handler:**
```javascript
app.use((err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Operational error (known error)
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  // Unknown error
  console.error('ERROR:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## 7. Frontend Implementation

### 7.1 Component Architecture

**Component Hierarchy:**
```
App Layout
├── Navbar
│   ├── Logo
│   ├── Navigation Links
│   └── User Menu
│       ├── Avatar
│       └── Dropdown
├── Sidebar (Dashboard)
│   ├── Project List
│   └── Quick Actions
└── Main Content
    └── Page Component
        ├── Board View
        │   ├── Column
        │   │   └── Task Card
        │   │       ├── Task Title
        │   │       ├── Assignee Avatar
        │   │       ├── Tags
        │   │       └── Due Date
        │   └── Add Column Button
        ├── Task Detail Modal
        │   ├── Header
        │   ├── Description Editor
        │   ├── Subtasks List
        │   ├── Comments Section
        │   └── Attachments
        └── Analytics Dashboard
            ├── Stats Cards
            ├── Charts
            └── Activity Feed
```

### 7.2 Key Pages

#### **Landing Page (`/`)**
- Hero section with CTA
- Feature showcase
- Tech stack display
- Redirect to dashboard if logged in

#### **Auth Page (`/auth`)**
- Login/Register tabs
- Email/password form
- OAuth buttons (Google, GitHub)
- Form validation with error messages

#### **Dashboard (`/dashboard`)**
- Recent projects grid
- Activity stream
- Quick stats (tasks due, in progress)
- Create project button

#### **Projects List (`/dashboard/projects`)**
- Grid/list view toggle
- Search and filter
- Project cards with members
- Archive toggle

#### **Kanban Board (`/dashboard/projects/[id]/board/[boardId]`)**
- Horizontal scrolling columns
- Drag-and-drop tasks
- Add task inline
- Task count per column
- Real-time updates

#### **Task Detail Modal**
- Full task information
- Markdown editor for description
- Assignee selector
- Date picker
- Comments with mentions
- File attachments
- Subtask checklist
- Time tracking

### 7.3 Drag and Drop Implementation

```typescript
// Using @hello-pangea/dnd
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const onDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result;
  
  if (!destination) return; // Dropped outside
  
  if (source.droppableId === destination.droppableId && 
      source.index === destination.index) {
    return; // Same position
  }
  
  // Optimistic update (update UI immediately)
  const newColumns = reorderColumns(columns, source, destination);
  setColumns(newColumns);
  
  // API call (persist to backend)
  try {
    await api.patch(`/tasks/${draggableId}/move`, {
      columnId: destination.droppableId,
      position: destination.index
    });
  } catch (error) {
    // Revert on error
    setColumns(columns);
    showNotification('Failed to move task', 'error');
  }
};
```

### 7.4 State Management (Zustand)

**authStore.ts:**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    set({ user: data.user, token: data.accessToken, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  refreshToken: async () => {
    const { data } = await api.post('/auth/refresh');
    localStorage.setItem('token', data.accessToken);
    set({ token: data.accessToken });
  }
}));
```

### 7.5 API Integration

**Axios Configuration:**
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add JWT token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const { data } = await axios.post('/auth/refresh');
        localStorage.setItem('token', data.accessToken);
        // Retry original request
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios(error.config);
      } catch {
        // Refresh failed, logout
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 7.6 Form Handling

**Task Creation Form:**
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: null
});

const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

const validate = () => {
  const newErrors = {};
  if (!formData.title.trim()) {
    newErrors.title = 'Title is required';
  }
  if (formData.title.length < 3) {
    newErrors.title = 'Title must be at least 3 characters';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) return;
  
  setIsSubmitting(true);
  try {
    await api.post('/tasks', {
      ...formData,
      board: boardId,
      column: columnId
    });
    showNotification('Task created successfully', 'success');
    onClose();
    refetchTasks();
  } catch (error) {
    showNotification(error.response?.data?.error || 'Failed to create task', 'error');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 8. Key Features

### 8.1 User Authentication
- Email/password registration and login
- Google OAuth integration
- GitHub OAuth integration
- JWT-based session management
- Refresh token rotation
- Password reset via email
- Remember me functionality

### 8.2 Project Management
- Create unlimited projects
- Project descriptions with Markdown
- Add/remove team members
- Role-based permissions (owner, admin, member, viewer)
- Archive/unarchive projects
- Project settings customization

### 8.3 Kanban Boards
- Multiple boards per project
- Customizable columns (To Do, In Progress, Done, etc.)
- Drag-and-drop tasks between columns
- Column limits (WIP limits)
- Swimlanes for horizontal grouping
- Board color coding

### 8.4 Task Management
- Create tasks with rich descriptions
- Assign tasks to team members
- Set priority levels (low, medium, high, critical)
- Due dates and reminders
- Task tags for categorization
- Task dependencies (blocking/blocked by)
- Sub-tasks/checklists
- Time tracking (estimated vs. actual)
- Task comments with @mentions
- File attachments (images, PDFs, docs)

### 8.5 Automation Rules
- If-then rule engine
- Triggers: task created, status changed, due date approaching
- Actions: move task, assign user, send notification
- Scheduled execution with node-cron
- Rule enable/disable toggle

### 8.6 Analytics Dashboard
- Task completion rate by project
- Time spent per task
- Task distribution by assignee
- Burndown charts
- Cycle time analysis
- Activity heatmap

### 8.7 Notifications
- In-app notification center
- Email notifications (optional)
- @mention notifications
- Task assignment notifications
- Due date reminders
- Real-time updates (on user actions)

### 8.8 Search & Filtering
- Global search across all tasks
- Filter by assignee, priority, tags
- Date range filters
- Advanced filters (overdue, unassigned)

### 8.9 User Management (Admin)
- View all users
- Promote/demote user roles
- Deactivate/reactivate users
- Search users

### 8.10 Dark Mode
- System preference detection
- Manual toggle
- Persistent across sessions
- All components support dark mode

---

## 9. Authentication & Security

### 9.1 Security Measures Implemented

1. **Password Security:**
   - bcrypt hashing with 10 salt rounds
   - Minimum 6 characters requirement
   - Passwords never stored in plain text

2. **JWT Security:**
   - Signed with secret key (256-bit)
   - Short-lived access tokens (24h)
   - HTTP-only cookies for refresh tokens
   - Token rotation on refresh

3. **HTTP Security Headers (helmet.js):**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security (HSTS)

4. **CORS Configuration:**
   - Whitelist specific origins
   - Credentials allowed for cookies
   - Restricted HTTP methods

5. **Rate Limiting:**
   - 100 requests per 15 minutes per IP
   - Prevents brute force attacks
   - DDoS protection

6. **Input Validation:**
   - Zod schema validation
   - Sanitization of user inputs
   - SQL injection prevention (NoSQL, but still sanitized)

7. **File Upload Security:**
   - File type whitelist (images, PDFs, docs)
   - File size limit (10MB)
   - Unique filenames to prevent overwrite
   - Separate upload directory

8. **Environment Variables:**
   - Secrets stored in .env (not committed)
   - Different configs for dev/prod
   - JWT secrets must be changed in production

### 9.2 OAuth Flow

**Google OAuth:**
```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User grants permission
4. Google redirects back with authorization code
5. Server exchanges code for access token
6. Fetch user profile from Google API
7. Find or create user in database
8. Generate JWT tokens
9. Redirect to dashboard with tokens
```

---

## 10. API Design

### 10.1 RESTful Conventions

- **GET** - Retrieve resource(s)
- **POST** - Create new resource
- **PATCH** - Partial update
- **PUT** - Full replacement (not used)
- **DELETE** - Remove resource

### 10.2 Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message",
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": {
    "field": "Specific error"
  }
}
```

### 10.3 HTTP Status Codes

- **200** - OK (success)
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate)
- **500** - Internal Server Error

---

## 11. State Management

### 11.1 State Categories

1. **Server State (API Data):**
   - Fetched from backend
   - Cached in Zustand stores
   - Invalidated on mutations
   - Examples: projects list, board data

2. **UI State:**
   - Local to components
   - Managed with useState
   - Examples: modal open/close, form inputs

3. **Global UI State:**
   - Shared across components
   - Managed with Zustand
   - Examples: dark mode, notifications

4. **Form State:**
   - Managed with useState
   - Validation errors
   - Submission status

### 11.2 Data Flow

```
User Action (e.g., create task)
  ↓
Component event handler
  ↓
Optimistic UI update (instant feedback)
  ↓
API call (axios)
  ↓
Backend processing
  ↓
Database update
  ↓
Response received
  ↓
Update Zustand store
  ↓
Components re-render (subscribed to store)
  ↓
UI reflects final state
```

---

## 12. Deployment Architecture

### 12.1 Deployment Platforms

**Frontend:** Vercel
- Automatic deployments from GitHub
- CDN for static assets
- Edge functions
- Zero-downtime deployments
- Custom domain support

**Backend:** Railway / Render
- Dockerized Node.js app
- Auto-scaling
- Environment variable management
- Health checks
- Log streaming

**Database:** MongoDB Atlas
- Free tier (512MB storage)
- Automated backups
- Connection from anywhere
- Built-in monitoring

### 12.2 Environment Configuration

**Development:**
```
Frontend: localhost:3000
Backend: localhost:5000
Database: localhost:27017 (Docker)
```

**Production:**
```
Frontend: https://nexboard.vercel.app
Backend: https://nexboard-api.railway.app
Database: mongodb+srv://...mongodb.net/nexboard
```

### 12.3 CI/CD Pipeline

**Automatic Deployments:**
1. Push code to GitHub main branch
2. Vercel detects changes
3. Run `npm run build`
4. Deploy if successful
5. Notify on success/failure

**Build Process:**
- Install dependencies
- TypeScript compilation
- Next.js build
- Static optimization
- Image optimization

---

## 13. Challenges & Solutions

### 13.1 Drag-and-Drop Performance

**Challenge:** Re-rendering entire board on every drag was slow.

**Solution:**
- Optimistic UI updates (update before API call)
- Debounced API calls
- Memoized components with React.memo
- Virtual scrolling for large task lists

### 13.2 Authentication Token Expiry

**Challenge:** Users logged out after 24 hours.

**Solution:**
- Implemented refresh tokens (7-day expiry)
- Automatic token refresh on 401 errors
- Silent refresh in background

### 13.3 Real-time Updates

**Challenge:** Multiple users editing same board.

**Solution:**
- Polling every 30 seconds for updates
- Optimistic updates for instant feedback
- Conflict resolution (last-write-wins)
- (Note: WebSocket implementation planned for future)

### 13.4 Large Codebase Organization

**Challenge:** 15,000+ lines of code becoming hard to navigate.

**Solution:**
- Clear folder structure by feature
- Consistent naming conventions
- Component documentation
- Separation of concerns (services, controllers)

### 13.5 TypeScript Migration

**Challenge:** Initially JavaScript, needed type safety.

**Solution:**
- Incremental migration (file by file)
- Created comprehensive type definitions
- ~90% type coverage achieved

---

## 14. Future Enhancements

### 14.1 Planned Features

1. **Real-time Collaboration:**
   - WebSocket implementation
   - See who's viewing/editing
   - Live cursors on shared boards

2. **Advanced Analytics:**
   - Custom report builder
   - Export to PDF/Excel
   - Burnup charts
   - Velocity tracking

3. **Mobile App:**
   - React Native implementation
   - Native notifications
   - Offline support

4. **Integrations:**
   - Slack notifications
   - GitHub issue sync
   - Google Calendar sync
   - Zapier webhooks

5. **Enhanced Automation:**
   - More trigger types
   - Complex conditions (AND/OR)
   - Scheduled automations
   - Email actions

6. **Calendar View:**
   - Month/week/day views
   - Drag tasks to reschedule
   - Recurring tasks

7. **Templates:**
   - Project templates
   - Board templates
   - Task templates

8. **Time Tracking:**
   - Timer integration
   - Timesheet reports
   - Billable hours

### 14.2 Performance Optimizations

- Redis caching for frequently accessed data
- Database query optimization
- Image optimization (WebP format)
- Lazy loading for components
- Code splitting by route

### 14.3 Scalability Improvements

- Horizontal scaling with load balancer
- Database sharding for large datasets
- CDN for static assets
- Microservices architecture for specific features

---

## 15. Conclusion

NexBoard demonstrates a complete understanding of modern web development:

**Technical Skills:**
- Full-stack MERN development
- RESTful API design
- Database modeling
- Authentication & authorization
- State management
- UI/UX design
- Deployment & DevOps

**Soft Skills:**
- Problem-solving (architectural decisions)
- Code organization
- Documentation
- Version control (Git)
- Time management (completed in ~4 weeks)

This project is production-ready for small to medium teams and showcases industry-standard practices suitable for professional software development.

---

**Total Development Time:** ~150 hours  
**Final Deployment:** Vercel (Frontend) + Railway (Backend) + MongoDB Atlas (Database)  
**Live Demo:** https://nexboard.vercel.app  
**GitHub Repo:** https://github.com/yourusername/NexBoard

---

*Document prepared for project review interview*  
*Last updated: March 30, 2026*

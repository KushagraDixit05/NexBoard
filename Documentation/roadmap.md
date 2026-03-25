# NexBoard - Project Roadmap & Technical Documentation

> **Last Updated:** March 2026  
> **Version:** 1.0.0  
> **Status:** Active Development

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Repository Structure](#repository-structure)
4. [Tech Stack](#tech-stack)
5. [Client Application](#client-application)
6. [Server Application](#server-application)
7. [Database Models](#database-models)
8. [API Endpoints](#api-endpoints)
9. [Authentication & Authorization](#authentication--authorization)
10. [Features Implemented](#features-implemented)
11. [Development Guide](#development-guide)
12. [File Naming Conventions](#file-naming-conventions)

---

## Project Overview

**NexBoard** is a modern, full-stack Kanban project management platform rebuilt from Kanboard using cutting-edge web technologies. It provides comprehensive project tracking, task management, and team collaboration features with a beautiful, responsive UI.

### Key Highlights

- 🎯 **Full-Stack TypeScript/JavaScript** application
- 🔐 **Multi-provider Authentication** (Email, Google OAuth, GitHub OAuth)
- 📊 **Real-time Kanban Boards** with drag-and-drop
- 👥 **Team Collaboration** with role-based access control
- 📈 **Analytics & Reporting** capabilities
- 🎨 **Modern UI/UX** with Tailwind CSS
- 🚀 **Production-ready** with Docker support

---

## Architecture

### System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Next.js 14 (App Router)                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │  Pages   │  │Components│  │  State (Zustand) │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/REST API (axios)
                            │
┌─────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Express.js REST API                    │    │
│  │  ┌──────────┐  ┌────────────┐  ┌────────────────┐   │    │
│  │  │  Routes  │→│Controllers │→│   Middleware     │   │    │
│  │  └──────────┘  └────────────┘  └────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                   Mongoose ODM (MongoDB)
                            │
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│                     MongoDB (NoSQL)                         │
│   Users, Projects, Boards, Tasks, Comments, etc.            │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Architecture Patterns

- **Monorepo Structure**: Single repository managing both client and server
- **Client-Server Model**: Decoupled frontend and backend
- **RESTful API**: Standard HTTP methods for resource operations
- **MVC Pattern**: Model-View-Controller separation on server
- **Component-Based**: React components with TypeScript
- **Store Pattern**: Zustand for global state management

---

## Repository Structure

See the complete directory structure in the full documentation or explore the repository.

**Key Directories:**
- `client/` - Next.js 14 frontend application
- `server/` - Express.js backend API
- `Documentation/` - Project documentation
- `docker-compose.yml` - Docker orchestration

---

## Tech Stack

### Frontend
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS, Zustand, Axios
- @hello-pangea/dnd (drag-and-drop)
- Radix UI, Lucide icons, Recharts

### Backend
- Node.js 18+, Express.js 4.x
- MongoDB 7.x, Mongoose 8.x
- JWT, bcryptjs, Passport (OAuth)
- Zod validation, Multer (uploads)
- Bull (job queue), Nodemailer

---

## Client Application

### Routing Structure

**All dashboard routes are prefixed with `/dashboard` for clear separation of authenticated content.**

| Route | Purpose | Component |
|-------|---------|-----------|
| `/` | Landing page (public) | LandingPage |
| `/auth` | Login/Register page | AuthPage |
| `/callback` | OAuth callback handler | OAuthCallbackPage |
| `/dashboard` | Dashboard home | DashboardPage |
| `/dashboard/projects` | Projects list | ProjectsListPage |
| `/dashboard/projects/new` | Create project | CreateProjectPage |
| `/dashboard/projects/[projectId]` | Project details | ProjectDetailsPage |
| `/dashboard/projects/[projectId]/board/[boardId]` | Kanban board view | KanbanBoardPage |
| `/dashboard/projects/[projectId]/members` | Manage team members | ProjectMembersPage |
| `/dashboard/projects/[projectId]/settings` | Project settings | ProjectSettingsPage |
| `/dashboard/notifications` | User notifications | NotificationsPage |
| `/dashboard/admin/users` | User management (admin) | AdminUsersPage |

### App Directory Structure

```
client/app/
├── (auth)/                    ← Route group (doesn't affect URL)
│   ├── auth/page.tsx          → /auth
│   ├── callback/page.tsx      → /callback
│   └── layout.tsx
├── dashboard/                 ← Actual route segment
│   ├── admin/users/page.tsx   → /dashboard/admin/users
│   ├── notifications/page.tsx → /dashboard/notifications
│   ├── projects/
│   │   ├── new/page.tsx       → /dashboard/projects/new
│   │   ├── [projectId]/
│   │   │   ├── board/[boardId]/page.tsx
│   │   │   ├── members/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── page.tsx       → /dashboard/projects/[projectId]
│   │   └── page.tsx           → /dashboard/projects
│   ├── layout.tsx
│   └── page.tsx               → /dashboard
├── layout.tsx                 → Root layout
├── not-found.tsx              → 404 page
└── page.tsx                   → / (landing)
```

**Key Points:**
- Route groups like `(auth)` organize code but don't affect URLs
- The `dashboard/` folder creates the `/dashboard` URL prefix
- Dynamic segments use `[param]` syntax: `[projectId]`, `[boardId]`
- All authenticated routes live under `/dashboard`

### State Management

- **authStore.ts** - Authentication and user session
- **boardStore.ts** - Kanban board, tasks, drag-and-drop
- **notificationStore.ts** - In-app notifications

---

## Server Application

### API Controllers

- **auth.controller.js** - Authentication, OAuth
- **user.controller.js** - User management
- **project.controller.js** - Project CRUD
- **board.controller.js** - Board management
- **column.controller.js** - Column operations
- **task.controller.js** - Task CRUD
- **comment.controller.js** - Comments
- **attachment.controller.js** - File uploads
- And more...

### Middleware

- **auth.middleware.js** - JWT verification
- **role.middleware.js** - Authorization
- **validate.middleware.js** - Zod validation
- **rateLimiter.middleware.js** - Rate limiting
- **upload.middleware.js** - File uploads
- **errorHandler.middleware.js** - Error handling

---

## Database Models

### Core Models

1. **User** - Users, authentication, roles
2. **Project** - Projects, members, ownership
3. **Board** - Kanban boards
4. **Column** - Board columns
5. **Task** - Tasks with assignees, priority, dates
6. **Comment** - Task comments
7. **Attachment** - File attachments
8. **Subtask** - Task subtasks
9. **Notification** - User notifications
10. **Swimlane** - Horizontal task grouping
11. **TaskDependency** - Task dependencies
12. **ActivityLog** - Audit trail
13. **AutomationRule** - Workflow automation
14. **CustomField** - Custom fields

---

## API Endpoints

Base URL: \`http://localhost:5000/api\`

### Authentication (\`/auth\`)
- POST \`/auth/register\` - Register
- POST \`/auth/login\` - Login
- POST \`/auth/logout\` - Logout
- POST \`/auth/refresh\` - Refresh token
- GET \`/auth/me\` - Get current user
- GET \`/auth/google\` - Google OAuth
- GET \`/auth/github\` - GitHub OAuth

### Resources
- \`/users\` - User management
- \`/projects\` - Projects
- \`/boards\` - Boards
- \`/columns\` - Columns
- \`/tasks\` - Tasks
- \`/comments\` - Comments
- \`/attachments\` - Attachments
- \`/subtasks\` - Subtasks
- \`/notifications\` - Notifications
- \`/analytics\` - Analytics

---

## Authentication & Authorization

### Authentication Methods

1. **Email/Password** - Traditional login with JWT
2. **Google OAuth** - Sign in with Google
3. **GitHub OAuth** - Sign in with GitHub

### Flow

1. User authenticates → Server generates JWT tokens
2. Access token (15min) + Refresh token (7d)
3. Client stores tokens in localStorage
4. Tokens sent in Authorization header
5. Automatic token refresh on expiry

### Roles

- **Admin** - Full system access
- **Owner** - Full project control
- **Member** - Edit project tasks
- **Viewer** - Read-only access

---

## Features Implemented

### ✅ Completed

#### Authentication
- [x] Email/password authentication
- [x] Google OAuth integration
- [x] GitHub OAuth integration
- [x] JWT with refresh tokens
- [x] Password hashing (bcrypt)
- [x] Session persistence

#### Project Management
- [x] Project CRUD operations
- [x] Team member management
- [x] Role-based access control
- [x] Project archiving

#### Kanban Features
- [x] Multiple boards per project
- [x] Dynamic columns
- [x] Drag-and-drop tasks
- [x] Task assignment
- [x] Priority levels
- [x] Due dates
- [x] Task descriptions
- [x] Comments
- [x] File attachments
- [x] Subtasks
- [x] Time tracking

#### UI/UX
- [x] Responsive design
- [x] Beautiful landing page
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Confirmation dialogs

### 🚧 Future Features

- [ ] Real-time updates (WebSockets)
- [ ] Advanced analytics
- [ ] Gantt chart view
- [ ] Calendar view
- [ ] Email notifications
- [ ] Search and filtering
- [ ] Export (PDF, CSV)
- [ ] Two-factor authentication

---

## Development Guide

### Setup

\`\`\`bash
# Clone repository
git clone <repo-url>
cd nexboard
npm install

# Start with Docker
docker-compose up -d

# Or start manually
cd server && npm run dev  # Terminal 1
cd client && npm run dev  # Terminal 2
\`\`\`

### Environment Variables

**Server (.env):**
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexboard
JWT_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
FRONTEND_URL=http://localhost:3000
\`\`\`

**Client (.env.local):**
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### Access

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- Health: http://localhost:5000/api/health

---

## File Naming Conventions

All page components use descriptive export names for clarity:

| File | Route | Component Name |
|------|-------|----------------|
| \`app/page.tsx\` | \`/\` | **LandingPage** |
| \`app/(auth)/auth/page.tsx\` | \`/auth\` | **AuthPage** |
| \`app/(auth)/callback/page.tsx\` | \`/callback\` | **OAuthCallbackPage** |
| \`app/dashboard/page.tsx\` | \`/dashboard\` | **DashboardPage** |
| \`app/dashboard/projects/page.tsx\` | \`/dashboard/projects\` | **ProjectsListPage** |
| \`app/dashboard/projects/new/page.tsx\` | \`/dashboard/projects/new\` | **CreateProjectPage** |
| \`app/dashboard/projects/[projectId]/page.tsx\` | \`/dashboard/projects/[projectId]\` | **ProjectDetailsPage** |
| \`app/dashboard/projects/[projectId]/board/[boardId]/page.tsx\` | \`/dashboard/projects/[projectId]/board/[boardId]\` | **KanbanBoardPage** |
| \`app/dashboard/projects/[projectId]/members/page.tsx\` | \`/dashboard/projects/[projectId]/members\` | **ProjectMembersPage** |
| \`app/dashboard/projects/[projectId]/settings/page.tsx\` | \`/dashboard/projects/[projectId]/settings\` | **ProjectSettingsPage** |
| \`app/dashboard/notifications/page.tsx\` | \`/dashboard/notifications\` | **NotificationsPage** |
| \`app/dashboard/admin/users/page.tsx\` | \`/dashboard/admin/users\` | **AdminUsersPage** |

**Layouts:**
- \`app/layout.tsx\` → **RootLayout**
- \`app/(auth)/layout.tsx\` → **AuthLayout**
- \`app/dashboard/layout.tsx\` → **DashboardLayout**

**Note:** Route groups like `(auth)` don't affect the URL path in Next.js App Router. The dashboard routes are now properly namespaced under `/dashboard` to avoid conflicts with the public landing page at `/`.

See \`Documentation/file-naming-updates.md\` for detailed naming patterns.

---

## Quick Reference

### Common Commands

\`\`\`bash
npm install          # Install dependencies
npm run dev          # Start both client & server
npm run build        # Build client for production
npm test             # Run tests
\`\`\`

### Important Files

- \`client/lib/api.ts\` - API client with interceptors
- \`client/store/authStore.ts\` - Auth state management
- \`server/src/app.js\` - Express application setup
- \`server/src/config/database.js\` - MongoDB connection
- \`server/src/middleware/auth.middleware.js\` - JWT auth

---

## Troubleshooting

**OAuth redirect fails**
→ Check \`FRONTEND_URL\` in server \`.env\`

**401 Unauthorized**
→ Verify JWT_SECRET, check token expiry

**MongoDB connection fails**
→ Ensure MongoDB is running

**File upload fails**
→ Check UPLOAD_DIR permissions

---

**Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: March 2026

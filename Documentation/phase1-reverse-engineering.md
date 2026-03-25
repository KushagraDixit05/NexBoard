# Phase 1: Reverse Engineering & Project Foundation

**Timeline:** Week 1–3  
**Focus:** Understand existing Kanboard, document requirements, initialize the new project  
**Effort Split:** 60% Analysis & Documentation, 40% Project Setup

---

## 1. Objectives

- Analyze the original Kanboard's MVC architecture, database schema, and workflows
- Document functional & non-functional requirements (SRS)
- Identify system limitations and gaps for enhancement
- Initialize the new project repository with Next.js 14 + Express + MongoDB
- Design the complete system architecture for the rebuild
- Define all MongoDB schemas and API contracts

---

## 2. Reverse Engineering of Existing Kanboard

### 2.1 Architecture Analysis

The original Kanboard follows a classic **MVC (Model-View-Controller)** pattern built in PHP:

| Layer | Original Location | Purpose |
|-------|------------------|---------|
| **Models** | `/app/Model/` | Data entities, database operations, business logic, validation |
| **Views** | `/app/Template/` | HTML templates with embedded PHP for rendering UI |
| **Controllers** | `/app/Controller/` | HTTP request handling, routing, session management |
| **Helpers** | `/app/Helper/` | Utility functions shared across the application |
| **Validators** | `/app/Validator/` | Input validation logic |
| **Actions** | `/app/Action/` | Automatic action handlers triggered by events |

**Additional architectural components:**
- **Router:** Maps URLs → Controller methods (custom routing, not a framework)
- **Event System:** Observer pattern — fires events on task creation, updates, completion; plugins and actions subscribe to these events
- **Plugin Architecture:** Extends core via event hooks; plugins live in `/data/plugins/`
- **Database Abstraction:** Supports SQLite, MySQL, PostgreSQL through a common abstraction layer

### 2.2 Database Schema Analysis

The original Kanboard uses relational tables. Below is the entity breakdown extracted from analysis:

**Core Entities:**

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| **Project** | id, name, description, is_active, created_at | Has many Boards, has many Users (via membership) |
| **Board** | id, project_id, columns, swimlanes | Belongs to Project, has many Columns |
| **Column** | id, board_id, title, position, task_limit | Belongs to Board, has many Tasks |
| **Task** | id, title, description, color, due_date, status, position, column_id, assignee_id, creator_id, time_spent, time_estimated | Belongs to Column, belongs to User (assignee), has many Subtasks, Comments, Attachments |
| **Subtask** | id, task_id, title, status, assignee_id, time_spent | Belongs to Task |
| **User** | id, username, email, password, role, is_active | Has many Tasks (assigned), belongs to many Projects |
| **Comment** | id, task_id, user_id, content, created_at | Belongs to Task, belongs to User |
| **Attachment** | id, task_id, user_id, filename, path, size | Belongs to Task |
| **Swimlane** | id, board_id, name, position, is_active | Belongs to Board |

**Additional Entities:**
- **UserGroup** — group membership for bulk permissions
- **ProjectPermission** — maps Users to Projects with role (Manager/Member)
- **TaskLink** — used for basic task linking (predecessor/successor)
- **Action** — stores automated action configurations

### 2.3 Key Workflow Analysis

#### Task Lifecycle

```
┌─────────┐    ┌───────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│  Create  │───▸│  Assign   │───▸│  Move   │───▸│ Complete │───▸│  Archive │
│   Task   │    │  to User  │    │ Columns │    │   Task   │    │  / Delete│
└─────────┘    └───────────┘    └─────────┘    └──────────┘    └──────────┘
     │                                │               │
     ▼                                ▼               ▼
  Event:                         Event:          Event:
  task.create                    task.move        task.close
     │                                │               │
     ▼                                ▼               ▼
  Listeners:                    Listeners:       Listeners:
  - Log activity                - Update pos     - Auto actions
  - Notify                      - Auto rules     - Notifications
  - Auto actions                - Notify         - Analytics update
```

**Step-by-step flow (original PHP):**
1. User submits form → `POST /task/create`
2. Router dispatches to `TaskCreationController::create()`
3. Controller validates input via `TaskValidator`
4. Controller calls `TaskCreationModel::create($data)`
5. Model inserts record into `tasks` table
6. Model fires `task.create` event via `EventManager`
7. Event listeners execute (log activity, send notifications, trigger auto-actions)
8. Controller redirects to board view
9. Board view fetches all columns + tasks and renders the Kanban UI

#### Board Rendering Flow

```
Request → BoardController::show()
  → BoardModel::getBoard($project_id)
    → ColumnModel::getAll($board_id)
    → TaskModel::getByColumn($column_id) [for each column]
    → SwimlaneModel::getAll($board_id)
  → Render template with data bound to HTML
  → Client-side JS enables drag-and-drop
```

#### Authentication Flow

```
Login Form → POST /auth/login
  → AuthController::login()
    → UserModel::getByUsername($username)
    → password_verify($input, $hash)
    → Session::create($user)
    → Redirect to dashboard
  → Middleware checks session on every request
  → Role checked per action (Admin/Manager/User)
```

### 2.4 Event-Driven Architecture

The original Kanboard uses an internal event system:

| Event | Trigger | Subscribers |
|-------|---------|------------|
| `task.create` | New task saved to DB | Activity log, notifications, auto-actions |
| `task.update` | Task fields modified | Activity log, notifications |
| `task.move` | Task dragged to new column | Position recalculation, auto-actions, notifications |
| `task.close` | Task marked complete | Auto-actions, analytics, notifications |
| `task.assignee_change` | Assignee updated | Notifications, activity log |
| `comment.create` | New comment posted | Notifications (including @mentions) |
| `subtask.update` | Subtask status changed | Parent task progress, notifications |

**Our rebuild equivalent:** Node.js `EventEmitter` service that fires these same events, with registered listeners for automation rules, notifications, and activity logging.

---

## 3. Requirement Documentation

### 3.1 Functional Requirements

**FR-01: User Management**
- FR-01.1: Users can register with email, username, and password
- FR-01.2: Users can log in/log out with JWT-based authentication
- FR-01.3: Admin can create, edit, deactivate, and delete user accounts
- FR-01.4: System supports three roles: Admin, Manager, User
- FR-01.5: Users can update their profile and notification preferences

**FR-02: Project Management**
- FR-02.1: Users can create, edit, archive, and delete projects
- FR-02.2: Project owners can add/remove members with role-based permissions
- FR-02.3: Projects contain one or more boards

**FR-03: Board Management**
- FR-03.1: Boards display tasks organized in columns (Kanban view)
- FR-03.2: Users can create, rename, reorder, and delete columns
- FR-03.3: Boards support swimlanes for categorization
- FR-03.4: Columns can have optional WIP (work-in-progress) limits

**FR-04: Task Management**
- FR-04.1: Users can create tasks with title, description (Markdown), color, due date, and assignee
- FR-04.2: Tasks can be moved between columns via drag-and-drop
- FR-04.3: Tasks support subtasks with individual status tracking
- FR-04.4: Tasks support file attachments (upload/download/delete)
- FR-04.5: Tasks support threaded comments with Markdown
- FR-04.6: Tasks have time tracking (estimated vs. spent)
- FR-04.7: Tasks maintain an activity history log
- FR-04.8: Tasks can be assigned colors for visual categorization

**FR-05: Search & Filtering**
- FR-05.1: Users can search tasks by title, description, assignee, status
- FR-05.2: Users can filter board view by assignee, color, due date, label

**FR-06: Activity Stream**
- FR-06.1: Dashboard displays recent activity across all user's projects
- FR-06.2: Project-level activity stream shows all changes within a project

### 3.2 Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | API response time < 200ms for standard CRUD operations |
| NFR-02 | Performance | Board rendering with 100+ tasks should complete in < 1 second |
| NFR-03 | Security | All passwords hashed with bcrypt (cost factor ≥ 10) |
| NFR-04 | Security | JWT tokens expire in 24h; refresh tokens in 7 days |
| NFR-05 | Security | All user inputs validated and sanitized (prevent NoSQL injection) |
| NFR-06 | Usability | Responsive design — functional on desktop, tablet, and mobile |
| NFR-07 | Usability | Drag-and-drop works with mouse and touch |
| NFR-08 | Reliability | Application handles concurrent users without data corruption |
| NFR-09 | Maintainability | Codebase follows ESLint rules, consistent naming conventions |
| NFR-10 | Scalability | MongoDB schema designed for horizontal scaling |

### 3.3 Gap Analysis (Limitations in Original Kanboard)

| # | Limitation | Impact | Enhancement Mapped |
|---|-----------|--------|--------------------|
| 1 | No task automation — all status updates are manual | Productivity loss, human error | Task Automation Rules |
| 2 | Minimal analytics — only basic activity stream | No visibility into team performance | Analytics Dashboard |
| 3 | No task dependencies — can't model blocking relationships | Can't manage complex workflows | Enhanced Workflow |
| 4 | Limited notifications — only basic email | Users miss critical updates | Notification System |
| 5 | No recurring tasks | Repetitive manual task creation | Enhanced Workflow |
| 6 | No custom fields on tasks | Rigid task structure | Enhanced Workflow |
| 7 | No real-time updates | Board stale until page refresh | Notification System (in-app) |
| 8 | No webhook integrations | Isolated from team communication tools | Notification System |
| 9 | No bulk operations | Tedious multi-task management | Enhanced Workflow |
| 10 | No exportable reports | Can't share metrics with stakeholders | Analytics Dashboard |

---

## 4. New Project Architecture Design

### 4.1 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR, routing, React Server Components |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **State Management** | Zustand | Lightweight client-side state |
| **Drag & Drop** | @hello-pangea/dnd | Kanban board drag-and-drop |
| **Charts** | Recharts | Analytics dashboard visualizations |
| **Backend** | Express.js | REST API server |
| **Database** | MongoDB + Mongoose | Document-based data storage |
| **Authentication** | JWT + bcrypt | Stateless auth with token refresh |
| **Validation** | Zod | Schema validation for API inputs |
| **Job Scheduling** | node-cron + Bull | Automation rules, recurring tasks, email queue |
| **Email** | Nodemailer | Email notifications and digests |
| **File Upload** | Multer | Attachment handling |
| **Testing** | Jest, Supertest, React Testing Library, Cypress | Full testing stack |

### 4.2 Monorepo Structure

```
kanboard-rebuild/
│
├── client/                          # Next.js 14 frontend
│   ├── app/                         # App Router pages
│   │   ├── (auth)/                  # Auth layout group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/             # Protected layout group
│   │   │   ├── layout.tsx           # Sidebar + header layout
│   │   │   ├── page.tsx             # Dashboard home
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx         # Project list
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx     # Project overview
│   │   │   │       ├── board/page.tsx    # Kanban board view
│   │   │   │       ├── analytics/page.tsx # Analytics dashboard
│   │   │   │       ├── automation/page.tsx # Automation rules
│   │   │   │       └── settings/page.tsx  # Project settings
│   │   │   ├── admin/
│   │   │   │   ├── users/page.tsx   # User management
│   │   │   │   └── settings/page.tsx
│   │   │   └── notifications/page.tsx
│   │   ├── api/                     # Next.js API routes (proxy or BFF)
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # Base components (Button, Input, Modal, etc.)
│   │   ├── board/                   # Board-specific components
│   │   ├── task/                    # Task-specific components
│   │   ├── analytics/               # Chart components
│   │   ├── automation/              # Rule builder components
│   │   └── notifications/           # Notification components
│   ├── lib/                         # Utilities
│   │   ├── api.ts                   # Axios instance + interceptors
│   │   ├── auth.ts                  # Auth helpers
│   │   └── utils.ts                 # General utilities
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useBoard.ts
│   │   ├── useTasks.ts
│   │   └── useNotifications.ts
│   ├── store/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── boardStore.ts
│   │   ├── taskStore.ts
│   │   └── notificationStore.ts
│   ├── types/                       # TypeScript interfaces
│   │   └── index.ts
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Express.js backend
│   ├── src/
│   │   ├── config/                  # Configuration
│   │   │   ├── db.js                # MongoDB connection
│   │   │   ├── env.js               # Environment variables
│   │   │   └── cors.js              # CORS settings
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Board.js
│   │   │   ├── Column.js
│   │   │   ├── Task.js
│   │   │   ├── Subtask.js
│   │   │   ├── Comment.js
│   │   │   ├── Attachment.js
│   │   │   ├── Swimlane.js
│   │   │   ├── AutomationRule.js
│   │   │   ├── RuleExecution.js
│   │   │   ├── Notification.js
│   │   │   ├── TaskDependency.js
│   │   │   ├── CustomField.js
│   │   │   └── ActivityLog.js
│   │   ├── routes/                  # Express route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── board.routes.js
│   │   │   ├── column.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── subtask.routes.js
│   │   │   ├── comment.routes.js
│   │   │   ├── attachment.routes.js
│   │   │   ├── swimlane.routes.js
│   │   │   ├── automation.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   ├── notification.routes.js
│   │   │   └── webhook.routes.js
│   │   ├── controllers/             # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── board.controller.js
│   │   │   ├── column.controller.js
│   │   │   ├── task.controller.js
│   │   │   ├── subtask.controller.js
│   │   │   ├── comment.controller.js
│   │   │   ├── attachment.controller.js
│   │   │   ├── swimlane.controller.js
│   │   │   ├── automation.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── webhook.controller.js
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── role.middleware.js   # Role-based access
│   │   │   ├── validate.middleware.js # Zod schema validation
│   │   │   ├── upload.middleware.js  # Multer file upload
│   │   │   ├── rateLimiter.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── services/                # Business logic
│   │   │   ├── eventEmitter.service.js   # Node EventEmitter for app events
│   │   │   ├── automation.service.js     # Rule engine
│   │   │   ├── notification.service.js   # Send notifications
│   │   │   ├── email.service.js          # Nodemailer transporter
│   │   │   ├── webhook.service.js        # Outgoing webhook calls
│   │   │   ├── analytics.service.js      # Aggregation pipelines
│   │   │   ├── scheduler.service.js      # node-cron job manager
│   │   │   └── activity.service.js       # Activity logging
│   │   ├── validators/              # Zod schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── task.validator.js
│   │   │   ├── project.validator.js
│   │   │   └── automation.validator.js
│   │   ├── utils/                   # Helpers
│   │   │   ├── jwt.js
│   │   │   ├── password.js
│   │   │   └── response.js
│   │   └── app.js                   # Express app setup
│   ├── index.js                     # Server entry point
│   ├── package.json
│   └── .env.example
│
├── docs/                            # Project documentation
│   ├── SRS.md                       # Software Requirements Specification
│   ├── architecture.md              # Architecture documentation
│   ├── database-design.md           # ER diagrams, schema docs
│   ├── api-docs.md                  # API endpoint documentation
│   └── diagrams/                    # UML and architecture diagrams
│
├── .gitignore
├── README.md
├── package.json                     # Root package.json (workspaces)
└── docker-compose.yml               # MongoDB + app containers
```

### 4.3 MongoDB Schema Design

Below are all the Mongoose schemas needed for the core application. Enhancement-specific schemas are detailed in Phase 4.

#### User Schema

```javascript
const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 8 },  // bcrypt hashed
  role:         { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  displayName:  { type: String, trim: true },
  avatar:       { type: String },  // URL or file path
  isActive:     { type: Boolean, default: true },
  notificationPreferences: {
    email:      { type: Boolean, default: true },
    inApp:      { type: Boolean, default: true },
    digest:     { type: String, enum: ['none', 'daily', 'weekly'], default: 'none' },
    webhookUrl: { type: String }  // Slack/Discord webhook
  },
  refreshToken: { type: String },
}, { timestamps: true });

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
```

#### Project Schema

```javascript
const projectSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  description:  { type: String },
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role:       { type: String, enum: ['manager', 'member'], default: 'member' }
  }],
  isArchived:   { type: Boolean, default: false },
  color:        { type: String, default: '#3b82f6' },
}, { timestamps: true });

projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
```

#### Board Schema

```javascript
const boardSchema = new mongoose.Schema({
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

boardSchema.index({ project: 1 });
```

#### Column Schema

```javascript
const columnSchema = new mongoose.Schema({
  board:        { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  title:        { type: String, required: true, trim: true },
  position:     { type: Number, required: true, default: 0 },
  taskLimit:    { type: Number, default: 0 },  // 0 = no limit (WIP limit)
  color:        { type: String, default: '#e5e7eb' },
}, { timestamps: true });

columnSchema.index({ board: 1, position: 1 });
```

#### Task Schema

```javascript
const taskSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String },  // Markdown content
  column:       { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true },
  board:        { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  swimlane:     { type: mongoose.Schema.Types.ObjectId, ref: 'Swimlane' },
  assignee:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position:     { type: Number, default: 0 },
  color:        { type: String, default: '#ffffff' },
  priority:     { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate:      { type: Date },
  startDate:    { type: Date },
  completedAt:  { type: Date },
  status:       { type: String, enum: ['open', 'in_progress', 'completed', 'archived'], default: 'open' },
  timeEstimated: { type: Number, default: 0 },  // in minutes
  timeSpent:    { type: Number, default: 0 },    // in minutes
  labels:       [{ type: String }],
  isRecurring:  { type: Boolean, default: false },
  recurringConfig: {
    frequency:  { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval:   { type: Number },
    nextDue:    { type: Date }
  },
  customFields: [{ 
    fieldId:    { type: mongoose.Schema.Types.ObjectId, ref: 'CustomField' },
    value:      { type: mongoose.Schema.Types.Mixed }
  }],
}, { timestamps: true });

taskSchema.index({ column: 1, position: 1 });
taskSchema.index({ board: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
```

#### Subtask Schema

```javascript
const subtaskSchema = new mongoose.Schema({
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  title:        { type: String, required: true, trim: true },
  status:       { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  assignee:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  position:     { type: Number, default: 0 },
  timeSpent:    { type: Number, default: 0 },
}, { timestamps: true });

subtaskSchema.index({ task: 1, position: 1 });
```

#### Comment Schema

```javascript
const commentSchema = new mongoose.Schema({
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:      { type: String, required: true },  // Markdown
  mentions:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // @mentioned users
}, { timestamps: true });

commentSchema.index({ task: 1, createdAt: -1 });
```

#### Attachment Schema

```javascript
const attachmentSchema = new mongoose.Schema({
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType:     { type: String },
  size:         { type: Number },  // bytes
  path:         { type: String, required: true },  // file system path
}, { timestamps: true });

attachmentSchema.index({ task: 1 });
```

#### Swimlane Schema

```javascript
const swimlaneSchema = new mongoose.Schema({
  board:        { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  name:         { type: String, required: true, trim: true },
  position:     { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

swimlaneSchema.index({ board: 1, position: 1 });
```

#### Activity Log Schema

```javascript
const activityLogSchema = new mongoose.Schema({
  project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:       { type: String, required: true },  // 'task.create', 'task.move', 'comment.create', etc.
  details:      { type: mongoose.Schema.Types.Mixed },  // { from: 'To Do', to: 'In Progress' }
  entityType:   { type: String, enum: ['task', 'board', 'column', 'project', 'comment', 'subtask'] },
  entityId:     { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ task: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
```

### 4.4 ER Diagram (Document Relationship Map)

```
┌──────────┐       ┌───────────┐       ┌──────────┐
│   User   │◀──────│  Project   │──────▸│  Board   │
│          │ owner/ │           │ 1:M   │          │
│          │ member └───────────┘       └────┬─────┘
└──┬───────┘                                 │
   │                                    ┌────┴─────┐
   │ assigned                           │          │
   │                              ┌─────┴──┐  ┌───┴──────┐
   │                              │ Column  │  │ Swimlane │
   │                              │         │  │          │
   │                              └────┬────┘  └──────────┘
   │                                   │ 1:M
   │                              ┌────┴────┐
   └─────────────────────────────▸│  Task   │
                                  │         │
                                  └──┬──┬──┬┘
                                     │  │  │
                              ┌──────┘  │  └──────┐
                              │         │         │
                         ┌────┴───┐ ┌───┴────┐ ┌──┴────────┐
                         │Subtask │ │Comment │ │Attachment  │
                         └────────┘ └────────┘ └───────────┘
```

---

## 5. Project Initialization Steps

### 5.1 Repository Setup

```bash
# Create project directory
mkdir kanboard-rebuild && cd kanboard-rebuild

# Initialize Git
git init
echo "node_modules/\n.env\n.next/\nuploads/\n*.log" > .gitignore

# Create root package.json for workspaces
npm init -y
```

**Root `package.json` (workspaces):**
```json
{
  "name": "kanboard-rebuild",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "test": "cd server && npm test && cd ../client && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### 5.2 Backend Initialization

```bash
mkdir server && cd server
npm init -y

# Core dependencies
npm install express mongoose dotenv cors helmet morgan
npm install jsonwebtoken bcryptjs cookie-parser
npm install zod multer nodemailer
npm install node-cron bull
npm install axios  # for outgoing webhooks

# Dev dependencies
npm install -D nodemon jest supertest
```

### 5.3 Frontend Initialization

```bash
cd .. && npx create-next-app@14 client --typescript --tailwind --eslint --app --src-dir=false

cd client
npm install zustand axios @hello-pangea/dnd recharts
npm install react-markdown remark-gfm  # Markdown rendering
npm install date-fns  # Date utilities
npm install lucide-react  # Icons
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast  # Headless UI

# Dev dependencies
npm install -D @testing-library/react @testing-library/jest-dom cypress
```

### 5.4 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    container_name: kanboard-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: kanboard

  server:
    build: ./server
    container_name: kanboard-server
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/kanboard
      - JWT_SECRET=your-secret-key
      - PORT=5000
    volumes:
      - ./server:/app
      - /app/node_modules

  client:
    build: ./client
    container_name: kanboard-client
    ports:
      - "3000:3000"
    depends_on:
      - server
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    volumes:
      - ./client:/app
      - /app/node_modules

volumes:
  mongo-data:
```

### 5.5 Environment Variables

**`server/.env.example`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kanboard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
```

**`client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 5.6 Git Branching Strategy

```
main                    ← Stable releases only
  └── dev               ← Integration branch
       ├── feature/auth              ← JWT authentication
       ├── feature/projects          ← Project CRUD
       ├── feature/boards            ← Board + columns + drag-drop
       ├── feature/tasks             ← Task management
       ├── feature/automation        ← Enhancement: Automation rules
       ├── feature/analytics         ← Enhancement: Analytics dashboard
       ├── feature/workflow          ← Enhancement: Enhanced workflow
       ├── feature/notifications     ← Enhancement: Notification system
       └── bugfix/*                  ← Bug fixes
```

**Commit convention:**
```
feat: add JWT authentication middleware
fix: resolve column reorder race condition
docs: add API documentation for task endpoints
test: add unit tests for automation service
refactor: extract event emitter to separate service
```

---

## 6. Deliverables Checklist

| # | Deliverable | Format | Status |
|---|------------|--------|--------|
| 1 | Local Kanboard installation (original PHP) for reference | Running instance | ☐ |
| 2 | Software Requirements Specification (SRS) | Markdown (10–15 pages) | ☐ |
| 3 | Gap analysis report | Section in SRS | ☐ |
| 4 | Architecture documentation with diagrams | Markdown + images | ☐ |
| 5 | ER diagram / Document relationship map | PNG/SVG | ☐ |
| 6 | Use case diagrams | PNG/SVG (Draw.io) | ☐ |
| 7 | Sequence diagrams (task lifecycle, auth flow) | PNG/SVG | ☐ |
| 8 | Initialized Git repository with monorepo structure | GitHub repo | ☐ |
| 9 | MongoDB schemas defined (all core models) | Code files | ☐ |
| 10 | Docker Compose for development environment | YAML file | ☐ |
| 11 | Project proposal document | Markdown (2–3 pages) | ☐ |

---

## 7. Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Environment setup issues (MongoDB, Node, Next.js) | Medium | Medium | Use Docker Compose for consistent setup |
| Incomplete understanding of original Kanboard | Medium | High | Focus on 3–4 key workflows; use official docs |
| Scope creep during requirements | High | High | Lock requirements by end of Week 3; defer extras to "future work" |
| Unfamiliarity with Mongoose/MongoDB patterns | Low | Medium | Follow schema design best practices; use online references |
| Time overrun on reverse engineering | Medium | Medium | Set strict time-boxes; document incrementally |

---

## 8. Week-by-Week Schedule

| Week | Focus | Key Output |
|------|-------|-----------|
| **Week 1** | Install original Kanboard, explore as user, study codebase structure, set up Git repo | Running Kanboard instance, initial observations doc |
| **Week 2** | Trace key workflows (task CRUD, board rendering, auth), analyze DB schema, study event system | Workflow diagrams, ER diagram, event catalog |
| **Week 3** | Write SRS (functional + non-functional requirements), gap analysis, initialize Next.js + Express project, define MongoDB schemas | SRS document, initialized monorepo, schema files |

---

## 9. Implementation Status (Current State)

**Last Updated:** March 2026

### 9.1 Architecture Implementation

✅ **Fully Implemented:**
- Monorepo structure with npm workspaces (client + server)
- Next.js 14.2.35 with App Router + TypeScript 5.4.5
- Express.js 4.18.2 with MongoDB (Mongoose 8.0.0)
- Complete tech stack as documented (Tailwind, Zustand, Recharts, @hello-pangea/dnd)
- Docker Compose setup for development

✅ **Models Implemented (14/15):**
1. User ✓ | 2. Project ✓ | 3. Board ✓ | 4. Column ✓ | 5. Task ✓
6. Subtask ✓ | 7. Comment ✓ | 8. File (Attachment) ✓ | 9. Swimlane ✓
10. AutomationRule ✓ | 11. Activity ✓ | 12. Label ✓ | 13. Notification ✓ | 14. Category ✓

⚠️ **Model Deviations:**
- **RuleExecution** model documented but not implemented (tracked via Activity + event logs)
- **Additional models** added: Analytics, Session (beyond original plan)

✅ **Route Modules (14 implemented):**
All 14 route modules exist: auth, users, projects, boards, columns, tasks, subtasks, comments, files, labels, notifications, analytics, automations, webhooks

⚠️ **Architecture Inconsistencies:**
- **Controllers:** Only 10 dedicated controllers implemented; 4 routes (analytics, automation, notification, webhook) have inlined logic
- **Recommendation:** Extract logic from route files into dedicated controllers for consistency

### 9.2 Beyond Phase 1 Scope

**Enhanced Features Already Implemented:**
- ✅ **OAuth 2.0 Integration** — Google + GitHub authentication via Passport.js
- ✅ **Advanced Automation System** — Event-driven rule execution with conditions & actions
- ✅ **Analytics Dashboard Backend** — Project stats, trends, workload, overdue tracking
- ✅ **Scheduler Service** — node-cron for recurring tasks & daily reminders
- ✅ **Email Service** — Nodemailer for notifications & reminders
- ✅ **Webhook Service** — Outbound webhooks for task events (partial)
- ✅ **Task Dependencies** — Model exists for prerequisite task relationships
- ✅ **Custom Fields** — Support for custom task metadata

### 9.3 Frontend Implementation

✅ **Core UI Complete:**
- 32 React components organized by feature (board/, task/, project/, ui/)
- Authentication pages (email + OAuth)
- Dashboard with project management
- Kanban board with drag-and-drop
- Task detail modal with full CRUD
- Admin user management (basic read-only)

⚠️ **Frontend Gaps:**
- Analytics pages not implemented (backend exists, UI missing)
- Automation rule builder not implemented (backend exists, UI missing)
- Search/filter functionality partially implemented
- Swimlane UI not implemented (types exist, no components)

### 9.4 Validation Coverage

✅ **Validators Implemented:**
- auth.validator.js (register, login)
- task.validator.js (create, update)
- project.validator.js (create, update)
- automation.validator.js (rule creation)

⚠️ **Missing Validators:**
- user, board, column, comment, subtask, swimlane, attachment (no dedicated validators)

### 9.5 Testing Status

⚠️ **Minimal Test Coverage:**
- Jest + Supertest configured in server
- React Testing Library configured in client
- Only 1 test file found: `client/__tests__/store/authStore.test.ts`
- **Recommendation:** Add comprehensive test coverage for all controllers and components

### 9.6 Key Metrics

| Metric | Documented | Implemented | Coverage |
|--------|-----------|-------------|----------|
| Tech Stack Items | 21 | 21 | 100% ✓ |
| Mongoose Models | 15 | 14 | 93% |
| Route Modules | 14 | 14 | 100% ✓ |
| Controllers | 14 | 10 | 71% |
| React Components | 32+ | 32 | 100% ✓ |
| Services | 2 | 8 | 400% (beyond scope) |

### 9.7 Code Cleanup Performed

**Removed Files:**
- `/server/src/utils/response.js` — Unused utility (AppError, successResponse, paginatedResponse)

**Code Quality:**
- ✅ No dead code blocks found
- ✅ No backup/temp files found
- ✅ No duplicate utilities found
- ✅ No TODO/FIXME comments lingering
- ✅ Clean codebase with good organization

### 9.8 Recommendations for Next Steps

**Priority 1 (Critical):**
1. Create 4 missing controllers (analytics, automation, notification, webhook)
2. Add comprehensive validators for all entities
3. Implement frontend UI for analytics and automation features
4. Add comprehensive test coverage (target: 70%+ coverage)

**Priority 2 (Important):**
5. Implement swimlane UI components
6. Complete webhook CRUD endpoints
7. Implement advanced search/filter functionality
8. Add API documentation (Postman/OpenAPI)

**Priority 3 (Enhancement):**
9. Add WebSocket support for real-time updates
10. Implement recurring task UI
11. Add comprehensive error boundaries
12. Performance optimization and monitoring

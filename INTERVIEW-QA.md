# NexBoard - Interview Questions & Answers

> **Purpose:** Comprehensive Q&A for project review interview  
> **Project:** NexBoard - Kanban Project Management Platform  
> **Developer:** Kushagra Dixit  
> **Date:** March 2026

---

## Table of Contents

1. [General Project Questions](#1-general-project-questions)
2. [Architecture & Design](#2-architecture--design)
3. [Frontend Questions (Next.js/React)](#3-frontend-questions-nextjsreact)
4. [Backend Questions (Node.js/Express)](#4-backend-questions-nodejsexpress)
5. [Database Questions (MongoDB)](#5-database-questions-mongodb)
6. [Authentication & Security](#6-authentication--security)
7. [State Management](#7-state-management)
8. [Performance & Optimization](#8-performance--optimization)
9. [Deployment & DevOps](#9-deployment--devops)
10. [Code Quality & Best Practices](#10-code-quality--best-practices)
11. [Challenges & Problem Solving](#11-challenges--problem-solving)
12. [Advanced Technical Questions](#12-advanced-technical-questions)

---

## 1. General Project Questions

### Q1: Tell me about your project in 2 minutes.

**Answer:**

NexBoard is a full-stack Kanban project management platform I built from scratch using the MERN stack with Next.js and TypeScript. It helps teams organize work visually using drag-and-drop boards, similar to Trello or Jira but with a modern tech stack.

The application has a Next.js 14 frontend with Server-Side Rendering, a RESTful Express.js backend, and MongoDB for data persistence. Key features include multi-provider authentication (email, Google, GitHub), role-based access control, drag-and-drop task management, automation rules, and analytics dashboards.

The project consists of over 15,000 lines of code with 52+ React components and 50+ API endpoints. I implemented comprehensive security measures including JWT authentication, bcrypt password hashing, rate limiting, and input validation.

It's deployed on Vercel for the frontend and Railway for the backend, demonstrating my understanding of modern deployment practices. The project showcases full-stack capabilities, RESTful API design, database modeling, authentication flows, and production-ready code.

---

### Q2: Why did you choose to build a Kanban board application?

**Answer:**

I chose this project for several strategic reasons:

1. **Comprehensive Scope:** It covers all aspects of full-stack development - authentication, CRUD operations, real-time interactions, file uploads, and complex UI components.

2. **Real-World Relevance:** Project management tools are used daily in the industry, making it a practical and relatable project.

3. **Technical Challenges:** It involves interesting problems like drag-and-drop, state management, role-based permissions, and performance optimization.

4. **Demonstrates Multiple Skills:**
   - Frontend: Complex UI with drag-and-drop
   - Backend: RESTful API design
   - Database: Relational data modeling in NoSQL
   - Security: Authentication and authorization
   - DevOps: Production deployment

5. **Portfolio Value:** A working project management tool is more impressive than a simple CRUD app and demonstrates enterprise-level thinking.

---

### Q3: What makes your implementation different from existing solutions like Trello or Jira?

**Answer:**

While inspired by these tools, my implementation has key differences:

**Technical Differentiators:**
1. **Modern Tech Stack:** Next.js 14 with App Router, TypeScript, and Tailwind CSS vs. older frameworks
2. **Built-in Automation:** Custom rule engine for task automation without external tools
3. **Lightweight Architecture:** No complex microservices, easier to understand and maintain
4. **Open Source Approach:** Full codebase visibility and customizability

**Feature Differences:**
- **Simpler UX:** Focused on core Kanban features without overwhelming complexity
- **Developer-Friendly:** API-first design, easy to extend and integrate
- **Free & Self-Hostable:** No vendor lock-in, can deploy anywhere

**Educational Focus:**
- This was built to learn and demonstrate full-stack development
- Code is well-documented and follows best practices
- Architecture is designed for clarity and maintainability

The goal wasn't to compete with enterprise tools but to build a production-quality application that showcases modern web development skills.

---

### Q4: How long did it take to build this project?

**Answer:**

**Total Time:** Approximately 150 hours over 4-6 weeks

**Phase Breakdown:**
- **Week 1-2:** Architecture planning, database design, initial setup (25 hours)
- **Week 3-4:** Backend development (API endpoints, authentication, models) (50 hours)
- **Week 5-6:** Frontend development (UI components, pages, integration) (50 hours)
- **Week 7:** Testing, bug fixes, documentation (15 hours)
- **Week 8:** Deployment, optimization, polish (10 hours)

**Daily Commitment:** 3-5 hours on weekdays, 8-10 hours on weekends

**Development Approach:**
- Started with backend (API-first development)
- Built frontend incrementally
- Continuous testing and iteration
- Followed Agile-like sprints

The timeline includes learning new technologies like Next.js 14's App Router and implementing OAuth, which added development time but increased the project's value.

---

### Q5: What were the main technical challenges you faced?

**Answer:**

**1. Drag-and-Drop Performance:**
- **Problem:** Board re-rendered entirely on every drag, causing lag with 100+ tasks
- **Solution:** Implemented optimistic updates, memoized components with React.memo, and debounced API calls
- **Result:** Smooth 60fps dragging even with large datasets

**2. Authentication Token Management:**
- **Problem:** Users logged out unexpectedly after token expiry
- **Solution:** Implemented refresh tokens with automatic renewal, Axios interceptors for token rotation
- **Result:** Seamless user experience with secure session management

**3. Complex Data Relationships in NoSQL:**
- **Problem:** MongoDB doesn't have foreign keys, needed to maintain data integrity
- **Solution:** Used Mongoose refs with proper population, implemented cascading deletes with pre-remove hooks
- **Result:** Relational-like behavior in NoSQL database

**4. Real-time Updates Without WebSockets:**
- **Problem:** Multiple users editing same board needed synchronization
- **Solution:** Polling every 30 seconds, optimistic UI updates, conflict resolution strategy
- **Result:** Acceptable real-time feel for MVP (WebSockets planned for v2)

**5. TypeScript Migration:**
- **Problem:** Started with JavaScript, needed type safety as complexity grew
- **Solution:** Incremental migration, created comprehensive type definitions
- **Result:** 90% type coverage, caught many bugs during development

---

## 2. Architecture & Design

### Q6: Explain the overall architecture of your application.

**Answer:**

NexBoard follows a **three-tier client-server architecture**:

**Tier 1: Presentation Layer (Client)**
- **Technology:** Next.js 14 with React 18 and TypeScript
- **Responsibility:** UI rendering, user interactions, client-side routing
- **Communication:** HTTPS REST API calls to backend via Axios
- **State:** Zustand for global state, React hooks for local state

**Tier 2: Application Layer (Server)**
- **Technology:** Node.js with Express.js
- **Responsibility:** Business logic, authentication, API endpoints
- **Pattern:** MVC-inspired (Routes → Controllers → Services)
- **Middleware Stack:** helmet, cors, morgan, JWT auth, validation

**Tier 3: Data Layer (Database)**
- **Technology:** MongoDB with Mongoose ODM
- **Responsibility:** Data persistence, relationships, indexing
- **Schema:** 14 collections with references and embedded documents

**Communication Flow:**
```
User Browser
    ↓ (HTTPS)
Next.js Frontend (Port 3000)
    ↓ (REST API - JSON)
Express.js Backend (Port 5000)
    ↓ (Mongoose ODM)
MongoDB Database (Port 27017)
```

**Design Patterns:**
- **Repository Pattern:** Services abstract database operations
- **Middleware Chain:** Request processing pipeline
- **Singleton:** Database connection, Axios instance
- **Factory Pattern:** Model creation with Mongoose
- **Observer Pattern:** Event emitters for automation

---

### Q7: Why did you choose the MERN stack?

**Answer:**

I chose MERN (MongoDB, Express, React, Node) for several technical and practical reasons:

**1. JavaScript Everywhere:**
- Single language across frontend and backend
- Easy context switching
- Code reuse (validation logic, utilities)
- TypeScript compatibility on both ends

**2. MongoDB Benefits:**
- **Flexible Schema:** Iterate quickly without migrations
- **JSON Documents:** Natural fit for JavaScript
- **Horizontal Scalability:** Easy to scale out
- **Rich Queries:** Aggregation pipelines for analytics

**3. Express.js Advantages:**
- **Minimal & Flexible:** Not opinionated, build what you need
- **Large Ecosystem:** Thousands of middleware packages
- **Performance:** Async I/O handles high concurrency
- **Community:** Massive support, tutorials, solutions

**4. React/Next.js Benefits:**
- **Component Model:** Reusable, maintainable UI
- **Virtual DOM:** Efficient updates
- **SSR with Next.js:** SEO, performance
- **Large Job Market:** Industry-relevant skills

**5. Node.js Strengths:**
- **Non-blocking I/O:** Perfect for I/O-heavy applications
- **npm Ecosystem:** Largest package registry
- **Active Community:** Regular updates, security patches

**Alternatives Considered:**
- **PostgreSQL:** More rigid schema, didn't fit iterative development
- **Django/Flask:** Python, different language for backend
- **Spring Boot:** Java, steeper learning curve, heavier
- **LAMP:** Outdated, less relevant to modern industry

---

### Q8: Explain your folder structure and why you organized it this way.

**Answer:**

**Frontend Structure (Feature-Based):**
```
client/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Route group (auth pages)
│   ├── dashboard/           # Main application
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── ui/                  # Base components (Button, Modal)
│   ├── board/               # Board-specific components
│   ├── task/                # Task-specific components
│   └── project/             # Project-specific components
├── lib/                     # Utilities
│   ├── api.ts              # Axios configuration
│   └── utils.ts            # Helper functions
├── store/                   # Zustand stores
├── types/                   # TypeScript definitions
└── styles/                  # Global styles
```

**Why This Structure?**
- **Feature Folders:** Easy to find related code
- **Component Hierarchy:** ui/ → feature components
- **Separation of Concerns:** Logic (lib/) vs. UI (components/)
- **Type Safety:** Centralized type definitions

**Backend Structure (Layer-Based):**
```
server/
├── src/
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth, validation, errors
│   ├── services/            # Business logic
│   ├── validators/          # Zod schemas
│   ├── config/              # Configuration
│   └── app.js              # Express setup
├── index.js                 # Entry point
└── uploads/                 # File storage
```

**Why This Structure?**
- **Layered Architecture:** Clear separation (routes → controllers → services → models)
- **Single Responsibility:** Each file has one purpose
- **Testability:** Easy to mock and test individual layers
- **Scalability:** Add new features without touching existing code

**Benefits:**
- New developers can navigate easily
- Related files are close together
- Easy to refactor individual features
- Clear dependencies between layers

---

### Q9: How do you handle data flow in your application?

**Answer:**

**Data Flow Architecture:**

**1. User Action Flow:**
```
User clicks "Create Task" button
    ↓
React component event handler
    ↓
Optimistic Update (update UI immediately)
    ↓
API call via Axios (POST /api/tasks)
    ↓
Express route receives request
    ↓
Auth middleware verifies JWT
    ↓
Validation middleware checks data
    ↓
Controller function executes
    ↓
Service layer applies business logic
    ↓
Mongoose saves to MongoDB
    ↓
Response sent back to client
    ↓
Zustand store updated
    ↓
Components re-render (React hooks)
    ↓
UI shows success notification
```

**2. State Categories:**

**Server State (Backend Data):**
- **Where:** MongoDB database
- **How:** Fetched via REST API
- **Cached:** Zustand stores
- **Invalidation:** On mutations (create/update/delete)
- **Example:** Projects list, board data, user profile

**Client State (UI State):**
- **Where:** Component memory
- **How:** React useState
- **Scope:** Local to component
- **Example:** Modal open/closed, form inputs, loading states

**Global State (Shared UI):**
- **Where:** Zustand stores
- **How:** useStore hooks
- **Scope:** App-wide
- **Example:** Auth state, dark mode, notifications

**3. Optimistic Updates:**
```typescript
// Update UI immediately for instant feedback
setTasks([...tasks, newTask]);

try {
  // Then sync with backend
  const response = await api.post('/tasks', newTask);
  // Update with real ID from backend
  setTasks(tasks => tasks.map(t => 
    t.tempId === newTask.tempId ? response.data : t
  ));
} catch (error) {
  // Revert on failure
  setTasks(tasks => tasks.filter(t => t.tempId !== newTask.tempId));
  showNotification('Failed to create task', 'error');
}
```

**4. Data Synchronization:**
- **Polling:** Every 30 seconds for board updates
- **Manual Refresh:** Pull-to-refresh gesture
- **Event-Driven:** Notifications trigger refetch
- **Cache Invalidation:** After mutations

---

### Q10: Explain your API design philosophy.

**Answer:**

My API follows **RESTful principles** with pragmatic adaptations:

**1. Resource-Based URLs:**
```
GET    /api/projects              # List resources
POST   /api/projects              # Create resource
GET    /api/projects/:id          # Get single resource
PATCH  /api/projects/:id          # Update resource
DELETE /api/projects/:id          # Delete resource
```

**2. Nested Resources:**
```
GET    /api/projects/:id/boards   # Boards in a project
POST   /api/tasks/:id/comments    # Add comment to task
DELETE /api/projects/:projectId/members/:userId
```

**3. HTTP Methods Semantics:**
- **GET:** Read (idempotent, no side effects)
- **POST:** Create (not idempotent)
- **PATCH:** Partial update
- **DELETE:** Remove

**4. Status Codes:**
- **200:** Success
- **201:** Created
- **400:** Bad request (validation error)
- **401:** Unauthorized (not authenticated)
- **403:** Forbidden (insufficient permissions)
- **404:** Not found
- **500:** Server error

**5. Consistent Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Task created successfully",
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "dueDate": "Must be a valid date"
  }
}
```

**6. Versioning Strategy:**
- Currently v1 (implicit)
- Future: `/api/v2/` for breaking changes
- Backward compatibility for minor changes

**7. Pagination:**
```
GET /api/tasks?page=1&limit=50&sort=-createdAt
```

**8. Filtering:**
```
GET /api/tasks?assignee=userId&priority=high&status=open
```

**9. Authentication:**
- JWT in Authorization header: `Bearer <token>`
- Refresh token in HTTP-only cookie (more secure)

**Why This Design?**
- **Predictable:** Developers know what to expect
- **Self-Documenting:** URLs describe resources
- **Stateless:** Each request is independent
- **Cacheable:** GET requests can be cached
- **Scalable:** Easy to add new endpoints

---

## 3. Frontend Questions (Next.js/React)

### Q11: Why did you choose Next.js over Create React App?

**Answer:**

Next.js offers several advantages over vanilla React:

**1. Server-Side Rendering (SSR):**
- **CRA:** Client-side only, blank screen during JS load
- **Next.js:** HTML rendered on server, instant content
- **Benefit:** Better SEO, faster perceived performance

**2. File-Based Routing:**
- **CRA:** Need React Router, manual route configuration
- **Next.js:** `app/dashboard/page.tsx` → `/dashboard`
- **Benefit:** Less boilerplate, automatic code splitting

**3. API Routes:**
- **CRA:** Need separate backend or proxy
- **Next.js:** Can build backend in same project
- **Benefit:** Unified deployment (though I used separate backend)

**4. Image Optimization:**
- **CRA:** Manual optimization needed
- **Next.js:** Automatic WebP conversion, lazy loading
- **Benefit:** Better performance out of the box

**5. Built-in Optimizations:**
- Automatic code splitting per route
- Prefetching of linked pages
- Font optimization
- Zero-config bundling

**6. App Router (Next.js 14):**
- React Server Components
- Streaming and Suspense
- Layouts and nested routes
- Better data fetching patterns

**Trade-offs:**
- **Learning Curve:** Steeper than CRA
- **Complexity:** More concepts to understand
- **Bundle Size:** Slightly larger initial bundle

**For This Project:**
- SSR improves landing page performance
- File-based routing simplified navigation
- Image optimization for avatars and attachments
- Industry relevance (Next.js is widely adopted)

---

### Q12: Explain how you implemented drag-and-drop functionality.

**Answer:**

I used **@hello-pangea/dnd** (fork of react-beautiful-dnd):

**1. Setup:**
```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Wrap the entire board
<DragDropContext onDragEnd={handleDragEnd}>
  {/* Columns and tasks here */}
</DragDropContext>
```

**2. Droppable (Columns):**
```typescript
<Droppable droppableId={column._id} type="TASK">
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`column ${snapshot.isDraggingOver ? 'highlight' : ''}`}
    >
      {tasks.map((task, index) => (
        <Draggable key={task._id} draggableId={task._id} index={index}>
          {/* Task card */}
        </Draggable>
      ))}
      {provided.placeholder}
    </div>
  )}
</Droppable>
```

**3. Draggable (Tasks):**
```typescript
<Draggable draggableId={task._id} index={index}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
    >
      {/* Task content */}
    </div>
  )}
</Draggable>
```

**4. Drag End Handler:**
```typescript
const handleDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result;
  
  // Dropped outside
  if (!destination) return;
  
  // Same position
  if (source.droppableId === destination.droppableId && 
      source.index === destination.index) return;
  
  // Optimistic update (instant UI feedback)
  const updatedColumns = moveTask(
    columns,
    source,
    destination
  );
  setColumns(updatedColumns);
  
  // Persist to backend
  try {
    await api.patch(`/tasks/${draggableId}/move`, {
      columnId: destination.droppableId,
      position: destination.index
    });
  } catch (error) {
    // Revert on failure
    setColumns(columns);
    showError('Failed to move task');
  }
};
```

**5. Position Calculation:**
```typescript
// Backend calculates position between adjacent tasks
const calculatePosition = (column, index) => {
  const tasks = column.tasks.sort((a, b) => a.position - b.position);
  
  if (index === 0) {
    // First position
    return tasks[0] ? tasks[0].position / 2 : 1000;
  }
  if (index >= tasks.length) {
    // Last position
    return tasks[tasks.length - 1].position + 1000;
  }
  // Between two tasks
  return (tasks[index - 1].position + tasks[index].position) / 2;
};
```

**6. Performance Optimization:**
- **Memoization:** Wrap Column components in React.memo
- **Virtualization:** For boards with 100+ tasks (not yet implemented)
- **Debouncing:** Group rapid drags into single API call

**Challenges Solved:**
- **State Management:** Keeping client and server in sync
- **Position Conflicts:** Using fractional positions (0.5, 1.5, etc.)
- **Performance:** Preventing unnecessary re-renders

---

### Q13: How do you manage state in your React application?

**Answer:**

I use a **hybrid state management approach**:

**1. Zustand for Global State:**

**Auth Store:**
```typescript
// store/authStore.ts
import create from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    set({ 
      user: data.user, 
      token: data.accessToken, 
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    router.push('/auth');
  }
}));
```

**Usage in Components:**
```typescript
const { user, isAuthenticated, logout } = useAuthStore();
```

**2. React Hooks for Local State:**

**Form State:**
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  priority: 'medium'
});

const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

**UI State:**
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [activeTab, setActiveTab] = useState('details');
const [searchQuery, setSearchQuery] = useState('');
```

**3. Server State (API Data):**

**Fetching Pattern:**
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchProjects();
}, []);
```

**4. Context API (Minimal Use):**

**Theme Context:**
```typescript
const ThemeContext = createContext<ThemeContextType>(null);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**Why This Approach?**

**Zustand Advantages:**
- No boilerplate (vs. Redux)
- No context provider needed
- Better performance than Context API
- TypeScript support
- Small bundle size (1KB)

**When to Use What:**
- **Zustand:** Auth, notifications, theme (app-wide state)
- **useState:** Forms, modals, tabs (component-local state)
- **Server State:** API data with loading/error handling
- **Context:** Very rarely, only for deep prop drilling

**Alternative Considered:**
- **Redux:** Too much boilerplate for this project size
- **MobX:** Less popular, smaller community
- **Recoil:** Still experimental, less stable
- **TanStack Query:** Considered for future (better server state management)

---

### Q14: Explain your component structure and reusability strategy.

**Answer:**

I follow a **hierarchical component architecture**:

**1. Base Components (UI Library):**

**Button Component:**
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  children,
  onClick
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

**Modal Component:**
```typescript
// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
```

**2. Feature Components:**

**TaskCard Component:**
```typescript
// components/task/TaskCard.tsx
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <Badge variant={task.priority}>{task.priority}</Badge>
      <h3>{task.title}</h3>
      <div className="task-meta">
        <Avatar user={task.assignee} size="sm" />
        {task.dueDate && <DueDate date={task.dueDate} />}
      </div>
      <div className="task-tags">
        {task.tags.map(tag => <Tag key={tag} label={tag} />)}
      </div>
    </div>
  );
};
```

**3. Composition Pattern:**

**Column Component (Composing TaskCard):**
```typescript
// components/board/Column.tsx
export const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  return (
    <div className="column">
      <div className="column-header">
        <h2>{column.name}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="column-body">
        {tasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <Button variant="secondary" onClick={handleAddTask}>
        + Add Task
      </Button>
    </div>
  );
};
```

**4. Custom Hooks for Logic Reuse:**

**useAuth Hook:**
```typescript
// lib/hooks/useAuth.ts
export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();
  
  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  };
  
  const requireRole = (roles: string[]) => {
    if (!user || !roles.includes(user.role)) {
      throw new Error('Insufficient permissions');
    }
  };
  
  return { user, isAuthenticated, login, logout, requireAuth, requireRole };
};
```

**useDebounce Hook:**
```typescript
// lib/hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};
```

**5. Render Props Pattern:**

**Dropdown Component:**
```typescript
// components/ui/Dropdown.tsx
export const Dropdown: React.FC<DropdownProps> = ({ 
  trigger, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="dropdown">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger({ isOpen })}
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {children}
        </div>
      )}
    </div>
  );
};

// Usage
<Dropdown 
  trigger={({ isOpen }) => (
    <Button>
      Menu {isOpen ? '▲' : '▼'}
    </Button>
  )}
>
  <MenuItem>Option 1</MenuItem>
  <MenuItem>Option 2</MenuItem>
</Dropdown>
```

**Benefits of This Structure:**
- **Reusability:** Base components used everywhere
- **Consistency:** UI looks uniform
- **Maintainability:** Fix bug once, fixes everywhere
- **Testability:** Easy to unit test small components
- **Scalability:** Add new features without touching base components

---

### Q15: How do you handle forms and validation in React?

**Answer:**

I use a **controlled components approach with custom validation**:

**1. Form State Management:**

```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: null,
  assignee: null
});

const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

**2. Input Handlers:**

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  // Clear error when user types
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};
```

**3. Validation Logic:**

```typescript
const validate = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  // Required fields
  if (!formData.title.trim()) {
    newErrors.title = 'Title is required';
  } else if (formData.title.length < 3) {
    newErrors.title = 'Title must be at least 3 characters';
  } else if (formData.title.length > 200) {
    newErrors.title = 'Title must not exceed 200 characters';
  }
  
  // Date validation
  if (formData.dueDate) {
    const due = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (due < today) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
  }
  
  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (!validPriorities.includes(formData.priority)) {
    newErrors.priority = 'Invalid priority';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**4. Submit Handler:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  if (!validate()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const response = await api.post('/tasks', {
      ...formData,
      board: boardId,
      column: columnId
    });
    
    showNotification('Task created successfully', 'success');
    onSuccess(response.data);
    resetForm();
  } catch (error) {
    // Handle API errors
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
    } else {
      showNotification(error.response?.data?.error || 'Failed to create task', 'error');
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

**5. Form Component:**

```typescript
<form onSubmit={handleSubmit} className="task-form">
  {/* Title Input */}
  <div className="form-group">
    <label htmlFor="title">Title *</label>
    <input
      type="text"
      id="title"
      name="title"
      value={formData.title}
      onChange={handleChange}
      className={`input ${errors.title ? 'error' : ''}`}
      placeholder="Enter task title"
      disabled={isSubmitting}
    />
    {errors.title && <span className="error-message">{errors.title}</span>}
  </div>
  
  {/* Description Textarea */}
  <div className="form-group">
    <label htmlFor="description">Description</label>
    <textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      rows={4}
      placeholder="Add description (Markdown supported)"
    />
  </div>
  
  {/* Priority Select */}
  <div className="form-group">
    <label htmlFor="priority">Priority</label>
    <select
      id="priority"
      name="priority"
      value={formData.priority}
      onChange={handleChange}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </select>
  </div>
  
  {/* Submit Buttons */}
  <div className="form-actions">
    <Button type="button" variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit" variant="primary" loading={isSubmitting}>
      Create Task
    </Button>
  </div>
</form>
```

**6. Reusable Input Component:**

```typescript
interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = 'text',
  placeholder
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && '*'}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'error' : ''}`}
        placeholder={placeholder}
        required={required}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
```

**Why Not React Hook Form or Formik?**

For this project, I chose vanilla React because:
- **Learning:** Understanding form handling fundamentals
- **Control:** Full control over validation logic
- **Simplicity:** No extra dependencies for simple forms
- **Performance:** No unnecessary re-renders

However, for larger projects, I'd consider **React Hook Form** for better performance and less boilerplate.

---

## 4. Backend Questions (Node.js/Express)

### Q16: Explain your Express.js middleware stack.

**Answer:**

My middleware pipeline processes requests in order:

**1. Security Middleware (helmet):**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

**What it does:**
- Sets security HTTP headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Helps prevent common vulnerabilities

**2. CORS Middleware:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**What it does:**
- Allows cross-origin requests from frontend
- Enables cookie sharing
- Restricts to specific HTTP methods

**3. Request Logging (morgan):**
```javascript
const morgan = require('morgan');
app.use(morgan('dev')); // or 'combined' for production
```

**What it does:**
- Logs HTTP requests
- Shows method, URL, status, response time
- Helps debugging and monitoring

**4. Body Parsing:**
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

**What it does:**
- Parses JSON request bodies
- Parses URL-encoded forms
- Makes data available in `req.body`

**5. Cookie Parser:**
```javascript
const cookieParser = require('cookie-parser');
app.use(cookieParser());
```

**What it does:**
- Parses cookies from requests
- Makes cookies available in `req.cookies`
- Used for refresh tokens

**6. Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

**What it does:**
- Prevents abuse and DDoS attacks
- Limits requests per IP address
- Returns 429 status when exceeded

**7. Authentication Middleware (Custom):**
```javascript
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Usage in routes
app.use('/api/projects', authenticate, projectRoutes);
```

**8. Authorization Middleware (Role-Based):**
```javascript
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage
router.delete('/users/:id', 
  authenticate, 
  authorize(['admin']), 
  userController.deleteUser
);
```

**9. Validation Middleware (Zod):**
```javascript
const { z } = require('zod');

const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

// Schema
const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
});

// Usage
router.post('/tasks', 
  authenticate, 
  validateBody(createTaskSchema), 
  taskController.create
);
```

**10. Error Handler (Must be last):**
```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ error: `${field} already exists` });
  }
  
  // Default 500 error
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
});
```

**Middleware Order Matters!**
- Security first (helmet, cors)
- Logging before processing (morgan)
- Parsing before validation
- Authentication before authorization
- Validation before controllers
- Error handler last (catches all)

---

### Q17: How do you handle authentication and authorization?

**Answer:**

I implemented a **JWT-based authentication system with refresh tokens**:

**1. Registration Flow:**

```javascript
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existing = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create user (password hashed in pre-save hook)
    const user = await User.create({
      username,
      email,
      password,
      role: 'user'
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return access token and user data
    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};
```

**2. Password Hashing (Mongoose Pre-Save Hook):**

```javascript
// models/User.js
const bcrypt = require('bcryptjs');

userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method for password comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**3. Login Flow:**

```javascript
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Return access token
    res.json({
      accessToken,
      user: user.toPublicJSON() // Hide sensitive fields
    });
  } catch (error) {
    next(error);
  }
};
```

**4. Token Generation:**

```javascript
const jwt = require('jsonwebtoken');

// Access Token (short-lived, 24 hours)
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Refresh Token (long-lived, 7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      type: 'refresh'
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};
```

**5. Token Refresh Flow:**

```javascript
// POST /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Fetch user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Update refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    // Return new access token
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
```

**6. Authorization (Role-Based Access Control):**

```javascript
// middleware/role.middleware.js
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Usage examples
router.get('/admin/users', 
  authenticate, 
  authorize(['admin']), 
  userController.list
);

router.patch('/projects/:id', 
  authenticate, 
  authorize(['admin', 'manager']), 
  projectController.update
);
```

**7. Resource-Based Authorization:**

```javascript
// Check if user owns/can access a project
const canAccessProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is owner or member
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(m => m.user.toString() === userId);
    
    if (!isOwner && !isMember && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Attach project to request for controller use
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

// Usage
router.get('/projects/:projectId', 
  authenticate, 
  canAccessProject, 
  projectController.get
);
```

**8. OAuth Implementation (Google Example):**

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ 
        provider: 'google', 
        providerId: profile.id 
      });
      
      if (!user) {
        // Create new user
        user = await User.create({
          username: profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          displayName: profile.displayName,
          avatar: profile.photos[0].value,
          provider: 'google',
          providerId: profile.id,
          isActive: true
        });
      }
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// Routes
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate tokens
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/callback?token=${accessToken}`);
  }
);
```

**Security Measures:**
- **Password Hashing:** bcrypt with 10 salt rounds
- **JWT Secrets:** Stored in environment variables
- **HTTP-Only Cookies:** Refresh tokens can't be accessed by JavaScript
- **Short-Lived Access Tokens:** Minimize damage if stolen
- **Token Rotation:** New refresh token on each refresh
- **Role-Based Access:** Multiple authorization levels
- **Resource Ownership:** Users can only access their data

---

(Interview questions document continues... Would you like me to continue with more sections?)


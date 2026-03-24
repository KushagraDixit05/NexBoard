# Phase 2: Backend Development — Core API

**Timeline:** Week 4–6  
**Focus:** Build the complete Express.js REST API with MongoDB  
**Effort Split:** 80% Implementation, 20% Testing & Documentation

---

## 1. Objectives

- Set up Express.js server with proper middleware stack
- Connect MongoDB via Mongoose with all core schemas
- Implement JWT-based authentication with refresh tokens
- Build role-based access control (Admin, Manager, User)
- Create full REST API for all core resources (Projects, Boards, Columns, Tasks, Subtasks, Comments, Attachments, Swimlanes)
- Implement the event emitter service as the foundation for enhancements
- Add input validation, error handling, and rate limiting
- Document all API endpoints

---

## 2. Server Setup & Configuration

### 2.1 Entry Point (`server/index.js`)

```javascript
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');
const { initScheduler } = require('./src/services/scheduler.service');

const startServer = async () => {
  await connectDB();
  
  // Initialize cron jobs (for automation + recurring tasks — used in Phase 4)
  initScheduler();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
```

### 2.2 Express App (`server/src/app.js`)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { corsConfig } = require('./config/cors');
const errorHandler = require('./middleware/errorHandler.middleware');
const rateLimiter = require('./middleware/rateLimiter.middleware');

const app = express();

// --- Global Middleware ---
app.use(helmet());                      // Security headers
app.use(cors(corsConfig));              // CORS
app.use(morgan('dev'));                 // Request logging
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());               // Cookie parsing
app.use(rateLimiter);                  // Rate limiting

// --- Routes ---
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/projects',      require('./routes/project.routes'));
app.use('/api/boards',        require('./routes/board.routes'));
app.use('/api/columns',       require('./routes/column.routes'));
app.use('/api/tasks',         require('./routes/task.routes'));
app.use('/api/subtasks',      require('./routes/subtask.routes'));
app.use('/api/comments',      require('./routes/comment.routes'));
app.use('/api/attachments',   require('./routes/attachment.routes'));
app.use('/api/swimlanes',     require('./routes/swimlane.routes'));
app.use('/api/automation',    require('./routes/automation.routes'));
app.use('/api/analytics',     require('./routes/analytics.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/webhooks',      require('./routes/webhook.routes'));

// --- Static file serving for uploads ---
app.use('/uploads', express.static('uploads'));

// --- Health check ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// --- Error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
```

### 2.3 Database Connection (`server/src/config/db.js`)

```javascript
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Mongoose 7+ uses these defaults, but being explicit:
      autoIndex: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 2.4 Environment Config (`server/src/config/env.js`)

```javascript
require('dotenv').config();

module.exports = {
  PORT:                   process.env.PORT || 5000,
  MONGODB_URI:            process.env.MONGODB_URI || 'mongodb://localhost:27017/kanboard',
  JWT_SECRET:             process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_EXPIRES_IN:         process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_TOKEN_SECRET:   process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-change-me',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  SMTP_HOST:              process.env.SMTP_HOST,
  SMTP_PORT:              process.env.SMTP_PORT || 587,
  SMTP_USER:              process.env.SMTP_USER,
  SMTP_PASS:              process.env.SMTP_PASS,
  UPLOAD_DIR:             process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE:          parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  CORS_ORIGIN:            process.env.CORS_ORIGIN || 'http://localhost:3000',
};
```

### 2.5 CORS Config (`server/src/config/cors.js`)

```javascript
const { CORS_ORIGIN } = require('./env');

const corsConfig = {
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = { corsConfig };
```

---

## 3. Middleware Stack

### 3.1 JWT Authentication Middleware

```javascript
// server/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { authenticate };
```

### 3.2 Role-Based Access Control Middleware

```javascript
// server/src/middleware/role.middleware.js

// Restrict to specific roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

// Check project membership (user must be a member of the project)
const projectMember = async (req, res, next) => {
  const Project = require('../models/Project');
  const projectId = req.params.projectId || req.body.project;

  if (!projectId) return next(); // No project context

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const isOwner = project.owner.toString() === req.user._id.toString();
  const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isMember && !isAdmin) {
    return res.status(403).json({ error: 'Not a member of this project.' });
  }

  // Attach project and user's project role to request
  req.project = project;
  req.projectRole = isOwner ? 'owner' : 
    project.members.find(m => m.user.toString() === req.user._id.toString())?.role || 'member';
  
  next();
};

module.exports = { authorize, projectMember };
```

### 3.3 Validation Middleware (Zod)

```javascript
// server/src/middleware/validate.middleware.js
const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate body, query, and params depending on what the schema expects
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      next(error);
    }
  };
};

module.exports = { validate };
```

### 3.4 Error Handler Middleware

```javascript
// server/src/middleware/errorHandler.middleware.js

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Duplicate value for '${field}'.` });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Custom app errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Default: Internal server error
  res.status(500).json({ error: 'Internal server error.' });
};

module.exports = errorHandler;
```

### 3.5 Rate Limiter

```javascript
// server/src/middleware/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                    // limit each IP to 200 requests per window
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
```

### 3.6 File Upload Middleware

```javascript
// server/src/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');
const { UPLOAD_DIR, MAX_FILE_SIZE } = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar|csv/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed.'), false);
    }
  },
});

module.exports = { upload };
```

---

## 4. Authentication System

### 4.1 Auth Validators (`server/src/validators/auth.validator.js`)

```javascript
const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    username:    z.string().min(3).max(30).trim(),
    email:       z.string().email(),
    password:    z.string().min(8).max(128),
    displayName: z.string().max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email:    z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = { registerSchema, loginSchema };
```

### 4.2 Auth Routes (`server/src/routes/auth.routes.js`)

```javascript
const router = require('express').Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema), login);
router.post('/refresh',  refreshToken);
router.post('/logout',   authenticate, logout);
router.get('/me',        authenticate, getMe);

module.exports = router;
```

### 4.3 Auth Controller (`server/src/controllers/auth.controller.js`)

```javascript
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Check if user exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: 'User with this email or username already exists.' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      displayName: displayName || username,
    });

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ error: 'Refresh token required.' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, refreshToken, logout, getMe };
```

### 4.4 JWT Utility (`server/src/utils/jwt.js`)

```javascript
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken };
```

### 4.5 Password Utility (`server/src/utils/password.js`)

```javascript
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
```

---

## 5. Complete REST API Design

### 5.1 API Endpoints Reference

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and get tokens |
| POST | `/api/auth/refresh` | No | Refresh access token |
| POST | `/api/auth/logout` | Yes | Invalidate refresh token |
| GET | `/api/auth/me` | Yes | Get current user profile |

#### Users (Admin)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users` | Yes | Admin | List all users |
| GET | `/api/users/:id` | Yes | Admin | Get user by ID |
| PUT | `/api/users/:id` | Yes | Admin | Update user |
| PATCH | `/api/users/:id/role` | Yes | Admin | Change user role |
| PATCH | `/api/users/:id/deactivate` | Yes | Admin | Deactivate user |
| DELETE | `/api/users/:id` | Yes | Admin | Delete user |
| PUT | `/api/users/profile` | Yes | Any | Update own profile |
| PUT | `/api/users/preferences` | Yes | Any | Update notification preferences |

#### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects` | Yes | List user's projects |
| GET | `/api/projects/:projectId` | Yes | Get project details |
| PUT | `/api/projects/:projectId` | Yes | Update project |
| DELETE | `/api/projects/:projectId` | Yes | Delete project (owner/admin) |
| PATCH | `/api/projects/:projectId/archive` | Yes | Archive/unarchive project |
| POST | `/api/projects/:projectId/members` | Yes | Add member to project |
| DELETE | `/api/projects/:projectId/members/:userId` | Yes | Remove member |
| PATCH | `/api/projects/:projectId/members/:userId/role` | Yes | Change member role |
| GET | `/api/projects/:projectId/activity` | Yes | Get project activity stream |

#### Boards

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/boards` | Yes | Create board in project |
| GET | `/api/boards/project/:projectId` | Yes | List boards for project |
| GET | `/api/boards/:boardId` | Yes | Get board with columns & tasks |
| PUT | `/api/boards/:boardId` | Yes | Update board |
| DELETE | `/api/boards/:boardId` | Yes | Delete board |

#### Columns

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/columns` | Yes | Create column in board |
| GET | `/api/columns/board/:boardId` | Yes | List columns for board |
| PUT | `/api/columns/:columnId` | Yes | Update column |
| DELETE | `/api/columns/:columnId` | Yes | Delete column |
| PATCH | `/api/columns/reorder` | Yes | Reorder columns (batch position update) |

#### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/board/:boardId` | Yes | List tasks for board |
| GET | `/api/tasks/column/:columnId` | Yes | List tasks in column |
| GET | `/api/tasks/:taskId` | Yes | Get task with all details |
| PUT | `/api/tasks/:taskId` | Yes | Update task |
| DELETE | `/api/tasks/:taskId` | Yes | Delete task |
| PATCH | `/api/tasks/:taskId/move` | Yes | Move task to another column |
| PATCH | `/api/tasks/:taskId/assign` | Yes | Assign/unassign user |
| PATCH | `/api/tasks/:taskId/status` | Yes | Update task status |
| PATCH | `/api/tasks/reorder` | Yes | Reorder tasks within column |
| PATCH | `/api/tasks/:taskId/time` | Yes | Log time spent |
| POST | `/api/tasks/bulk` | Yes | Bulk update tasks |
| GET | `/api/tasks/search` | Yes | Search/filter tasks |

#### Subtasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/subtasks` | Yes | Create subtask |
| GET | `/api/subtasks/task/:taskId` | Yes | List subtasks for task |
| PUT | `/api/subtasks/:subtaskId` | Yes | Update subtask |
| DELETE | `/api/subtasks/:subtaskId` | Yes | Delete subtask |
| PATCH | `/api/subtasks/:subtaskId/status` | Yes | Toggle subtask status |

#### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/comments` | Yes | Create comment on task |
| GET | `/api/comments/task/:taskId` | Yes | List comments for task |
| PUT | `/api/comments/:commentId` | Yes | Edit comment (author only) |
| DELETE | `/api/comments/:commentId` | Yes | Delete comment (author/admin) |

#### Attachments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/attachments` | Yes | Upload file to task (multipart) |
| GET | `/api/attachments/task/:taskId` | Yes | List attachments for task |
| GET | `/api/attachments/:attachmentId/download` | Yes | Download attachment |
| DELETE | `/api/attachments/:attachmentId` | Yes | Delete attachment |

#### Swimlanes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/swimlanes` | Yes | Create swimlane |
| GET | `/api/swimlanes/board/:boardId` | Yes | List swimlanes for board |
| PUT | `/api/swimlanes/:swimlaneId` | Yes | Update swimlane |
| DELETE | `/api/swimlanes/:swimlaneId` | Yes | Delete swimlane |
| PATCH | `/api/swimlanes/reorder` | Yes | Reorder swimlanes |

---

## 6. Core Controller Implementations

### 6.1 Task Controller (Key Endpoints)

```javascript
// server/src/controllers/task.controller.js
const Task = require('../models/Task');
const Column = require('../models/Column');
const eventEmitter = require('../services/eventEmitter.service');
const activityService = require('../services/activity.service');

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, column, board, project, assignee, color, priority, dueDate,
            timeEstimated, labels, swimlane } = req.body;

    // Check column's WIP limit
    const col = await Column.findById(column);
    if (col.taskLimit > 0) {
      const taskCount = await Task.countDocuments({ column });
      if (taskCount >= col.taskLimit) {
        return res.status(400).json({ error: `Column "${col.title}" has reached its WIP limit (${col.taskLimit}).` });
      }
    }

    // Get next position in column
    const lastTask = await Task.findOne({ column }).sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title, description, column, board, project, swimlane,
      assignee, creator: req.user._id, color, priority, dueDate,
      timeEstimated, labels, position,
    });

    // Emit event for automation, notifications, and activity logging
    eventEmitter.emit('task.create', { task, user: req.user });

    // Log activity
    await activityService.log({
      project, task: task._id, user: req.user._id,
      action: 'task.create',
      details: { title: task.title },
      entityType: 'task', entityId: task._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:taskId/move
const moveTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { targetColumn, targetPosition, targetSwimlane } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const previousColumn = task.column;
    const previousPosition = task.position;

    // Check target column WIP limit
    if (targetColumn !== task.column.toString()) {
      const col = await Column.findById(targetColumn);
      if (col.taskLimit > 0) {
        const taskCount = await Task.countDocuments({ column: targetColumn });
        if (taskCount >= col.taskLimit) {
          return res.status(400).json({ error: `Target column has reached its WIP limit.` });
        }
      }
    }

    // Update positions of other tasks in the source column
    await Task.updateMany(
      { column: previousColumn, position: { $gt: previousPosition } },
      { $inc: { position: -1 } }
    );

    // Make room in target column at the target position
    await Task.updateMany(
      { column: targetColumn, position: { $gte: targetPosition } },
      { $inc: { position: 1 } }
    );

    // Move the task
    task.column = targetColumn;
    task.position = targetPosition;
    if (targetSwimlane) task.swimlane = targetSwimlane;
    await task.save();

    // Emit event
    eventEmitter.emit('task.move', {
      task,
      user: req.user,
      from: { column: previousColumn, position: previousPosition },
      to: { column: targetColumn, position: targetPosition },
    });

    // Log activity
    await activityService.log({
      project: task.project, task: task._id, user: req.user._id,
      action: 'task.move',
      details: { fromColumn: previousColumn, toColumn: targetColumn },
      entityType: 'task', entityId: task._id,
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/board/:boardId — Get all tasks for a board (grouped by columns)
const getTasksByBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const tasks = await Task.find({ board: boardId })
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar')
      .sort({ position: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:taskId — Get single task with all related data
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar')
      .populate('column', 'title')
      .populate('swimlane', 'name');

    if (!task) return res.status(404).json({ error: 'Task not found.' });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:taskId — Update task
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const allowedFields = ['title', 'description', 'color', 'priority', 'dueDate', 
                           'startDate', 'assignee', 'timeEstimated', 'labels', 'status'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Handle status change to completed
    if (updates.status === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date();
      eventEmitter.emit('task.close', { task, user: req.user });
    }

    Object.assign(task, updates);
    await task.save();

    eventEmitter.emit('task.update', { task, user: req.user, updates });

    await activityService.log({
      project: task.project, task: task._id, user: req.user._id,
      action: 'task.update',
      details: updates,
      entityType: 'task', entityId: task._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'username displayName avatar')
      .populate('creator', 'username displayName avatar');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/search — Search and filter tasks
const searchTasks = async (req, res, next) => {
  try {
    const { q, project, assignee, status, priority, color, dueBefore, dueAfter } = req.query;
    const filter = {};

    if (project)   filter.project = project;
    if (assignee)  filter.assignee = assignee;
    if (status)    filter.status = status;
    if (priority)  filter.priority = priority;
    if (color)     filter.color = color;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    if (dueBefore || dueAfter) {
      filter.dueDate = {};
      if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
      if (dueAfter)  filter.dueDate.$gte = new Date(dueAfter);
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'username displayName avatar')
      .populate('column', 'title')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, moveTask, getTasksByBoard, getTask, updateTask, searchTasks };
```

### 6.2 Board Controller (Full Board Data)

```javascript
// server/src/controllers/board.controller.js
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Swimlane = require('../models/Swimlane');

// GET /api/boards/:boardId — Full board with columns, tasks, and swimlanes
const getBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    
    const board = await Board.findById(boardId).populate('project', 'name');
    if (!board) return res.status(404).json({ error: 'Board not found.' });

    const [columns, tasks, swimlanes] = await Promise.all([
      Column.find({ board: boardId }).sort({ position: 1 }),
      Task.find({ board: boardId })
        .populate('assignee', 'username displayName avatar')
        .sort({ position: 1 }),
      Swimlane.find({ board: boardId, isActive: true }).sort({ position: 1 }),
    ]);

    // Group tasks by column
    const columnData = columns.map(col => ({
      ...col.toObject(),
      tasks: tasks.filter(t => t.column.toString() === col._id.toString()),
    }));

    res.json({
      board,
      columns: columnData,
      swimlanes,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/boards — Create board with default columns
const createBoard = async (req, res, next) => {
  try {
    const { name, description, project } = req.body;

    const board = await Board.create({ name, description, project });

    // Create default columns
    const defaultColumns = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    const columns = await Column.insertMany(
      defaultColumns.map((title, index) => ({
        board: board._id,
        title,
        position: index,
      }))
    );

    // Create default swimlane
    await Swimlane.create({
      board: board._id,
      name: 'Default',
      position: 0,
    });

    res.status(201).json({ board, columns });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBoard, createBoard };
```

### 6.3 Project Controller

```javascript
// server/src/controllers/project.controller.js
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    
    const project = await Project.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'manager' }],
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects — List all projects for current user
const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}  // Admins see all projects
      : { $or: [{ owner: req.user._id }, { 'members.user': req.user._id }] };

    const projects = await Project.find(filter)
      .populate('owner', 'username displayName avatar')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:projectId/members — Add member
const addMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    // Check if already a member
    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(409).json({ error: 'User is already a member.' });
    }

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:projectId/activity — Activity stream
const getActivity = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const activities = await ActivityLog.find({ project: projectId })
      .populate('user', 'username displayName avatar')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments({ project: projectId });

    res.json({
      activities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, addMember, getActivity };
```

---

## 7. Event Emitter Service

This is the **foundation for all enhancements** — automation rules, notifications, and analytics all subscribe to these events.

```javascript
// server/src/services/eventEmitter.service.js
const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow many subscribers
  }

  // Convenience method for logging
  emitWithLog(event, data) {
    console.log(`[Event] ${event}`, { taskId: data.task?._id, userId: data.user?._id });
    this.emit(event, data);
  }
}

// Singleton instance
const eventEmitter = new AppEventEmitter();

module.exports = eventEmitter;
```

**Supported events (used across all phases):**

| Event | Payload | Triggered By |
|-------|---------|-------------|
| `task.create` | `{ task, user }` | Task creation |
| `task.update` | `{ task, user, updates }` | Task field update |
| `task.move` | `{ task, user, from, to }` | Column move (drag-drop) |
| `task.close` | `{ task, user }` | Task marked complete |
| `task.delete` | `{ task, user }` | Task deletion |
| `task.assign` | `{ task, user, assignee }` | Assignee changed |
| `comment.create` | `{ comment, task, user, mentions }` | New comment |
| `subtask.update` | `{ subtask, task, user }` | Subtask status change |

---

## 8. Activity Logging Service

```javascript
// server/src/services/activity.service.js
const ActivityLog = require('../models/ActivityLog');

const activityService = {
  async log({ project, task, user, action, details, entityType, entityId }) {
    try {
      await ActivityLog.create({ project, task, user, action, details, entityType, entityId });
    } catch (error) {
      console.error('Activity logging failed:', error.message);
      // Non-blocking — don't throw
    }
  },
};

module.exports = activityService;
```

---

## 9. Standard Response Helper

```javascript
// server/src/utils/response.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

const paginatedResponse = (res, { data, page, limit, total }) => {
  return res.json({
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = { AppError, successResponse, paginatedResponse };
```

---

## 10. Task Route Definitions

```javascript
// server/src/routes/task.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const taskValidator = require('../validators/task.validator');
const {
  createTask, getTask, updateTask, moveTask,
  getTasksByBoard, searchTasks,
} = require('../controllers/task.controller');

router.use(authenticate); // All task routes require auth

router.post('/',               validate(taskValidator.createSchema), createTask);
router.get('/search',          searchTasks);
router.get('/board/:boardId',  getTasksByBoard);
router.get('/:taskId',        getTask);
router.put('/:taskId',        validate(taskValidator.updateSchema), updateTask);
router.patch('/:taskId/move', moveTask);

module.exports = router;
```

---

## 11. Deliverables Checklist

| # | Deliverable | Status |
|---|------------|--------|
| 1 | Express server with middleware stack | ☐ |
| 2 | MongoDB connection + all Mongoose models | ☐ |
| 3 | JWT auth system (register, login, refresh, logout) | ☐ |
| 4 | Role-based access control middleware | ☐ |
| 5 | Project CRUD API + member management | ☐ |
| 6 | Board CRUD API + full board data endpoint | ☐ |
| 7 | Column CRUD + reorder API | ☐ |
| 8 | Task CRUD + move + assign + search API | ☐ |
| 9 | Subtask CRUD API | ☐ |
| 10 | Comment CRUD API | ☐ |
| 11 | Attachment upload/download/delete API | ☐ |
| 12 | Swimlane CRUD API | ☐ |
| 13 | Event emitter service (foundation) | ☐ |
| 14 | Activity logging service | ☐ |
| 15 | Input validation (Zod schemas) for all endpoints | ☐ |
| 16 | Error handling middleware | ☐ |
| 17 | Rate limiting | ☐ |
| 18 | API documentation (Postman collection or markdown) | ☐ |
| 19 | Unit tests for auth + task controller | ☐ |

---

## 12. Week-by-Week Schedule

| Week | Focus | Key Output |
|------|-------|-----------|
| **Week 4** | Express setup, MongoDB connection, all Mongoose models, auth system (register/login/refresh/logout), role middleware | Working auth API, all schemas in DB |
| **Week 5** | Project + Board + Column + Swimlane CRUD APIs, event emitter service, activity logging | Full project/board management API |
| **Week 6** | Task CRUD + move + search, Subtask/Comment/Attachment APIs, validation for all endpoints, Postman collection | Complete core API, ready for frontend integration |

---

## 13. Risks and Mitigation

| Risk | Mitigation |
|------|-----------|
| Complex task move logic (position management) | Use atomic MongoDB operations; write thorough tests for reorder |
| JWT token management edge cases | Test expiry, refresh, and concurrent session scenarios |
| File upload security | Validate file types strictly; scan filenames; use unique names |
| Race conditions on concurrent column moves | Use MongoDB's atomic `$inc` operations; consider optimistic locking |
| API growing too large to manage | Keep controllers thin; move logic to services; use consistent patterns |

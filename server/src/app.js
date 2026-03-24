const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const { corsConfig } = require('./config/cors');
const errorHandler = require('./middleware/errorHandler.middleware');
const rateLimiter = require('./middleware/rateLimiter.middleware');

// Import automation service to register its event listeners at startup
require('./services/automation.service');
require('./services/notification.service');

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(cors(corsConfig));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimiter);

// --- API Routes ---
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
app.use('/uploads', express.static(path.resolve('./uploads')));

// --- Health check ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// --- 404 fallback ---
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// --- Error handler (must be last) ---
app.use(errorHandler);

module.exports = app;

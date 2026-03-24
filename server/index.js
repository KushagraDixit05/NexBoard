const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');
const { initScheduler } = require('./src/services/scheduler.service');

const startServer = async () => {
  await connectDB();

  // Initialize cron jobs (due-date reminders, recurring tasks)
  initScheduler();

  app.listen(PORT, () => {
    console.log(`🚀 NexBoard server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

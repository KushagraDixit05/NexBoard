const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow many subscribers across services
  }

  /**
   * Emit with structured logging.
   * @param {string} event - Event name e.g. 'task.create'
   * @param {object} data  - Payload
   */
  emitWithLog(event, data) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Event] ${event}`, {
        taskId:  data.task?._id,
        userId:  data.user?._id,
      });
    }
    this.emit(event, data);
  }
}

/**
 * Singleton event emitter used across all services.
 *
 * Supported events:
 *   task.create    { task, user }
 *   task.update    { task, user, updates }
 *   task.move      { task, user, from, to }
 *   task.close     { task, user }
 *   task.delete    { task, user }
 *   task.assign    { task, user, assignee }
 *   comment.create { comment, task, user, mentions }
 *   subtask.update { subtask, task, user }
 */
const eventEmitter = new AppEventEmitter();

module.exports = eventEmitter;

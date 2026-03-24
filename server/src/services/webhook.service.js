const axios = require('axios');

const webhookService = {
  /**
   * Fire an outgoing webhook to a remote URL.
   * @param {string} url   - Destination webhook URL (Slack, Discord, custom)
   * @param {object} payload - Data to send
   */
  async fire(url, payload) {
    try {
      await axios.post(url, payload, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(`[WebhookService] Fired webhook to ${url}`);
    } catch (error) {
      console.error(`[WebhookService] Failed to fire webhook to ${url}:`, error.message);
      // Non-blocking
    }
  },

  /**
   * Build a standardized webhook payload.
   */
  buildPayload(event, data) {
    return {
      event,
      timestamp: new Date().toISOString(),
      data,
    };
  },

  /**
   * Send a Slack-compatible message (text + optional colour).
   */
  async sendSlack(webhookUrl, { text, color = '#3b82f6', fields = [] }) {
    const payload = {
      attachments: [{
        color,
        text,
        fields: fields.map(f => ({ title: f.title, value: f.value, short: true })),
        footer: 'NexBoard',
        ts:     Math.floor(Date.now() / 1000),
      }],
    };
    return this.fire(webhookUrl, payload);
  },
};

module.exports = webhookService;

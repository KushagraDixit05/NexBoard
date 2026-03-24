const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NODE_ENV } = require('../config/env');

let transporter;

if (NODE_ENV === 'production' && SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  // Development: use ethereal (fake SMTP) or just log
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('[EmailService] DEV mode — email not sent:', {
        to:      mailOptions.to,
        subject: mailOptions.subject,
      });
      return { messageId: 'dev-mode' };
    },
  };
}

const emailService = {
  async sendMail({ to, subject, html, text }) {
    try {
      const info = await transporter.sendMail({
        from:    SMTP_USER || 'noreply@nexboard.app',
        to,
        subject,
        html,
        text,
      });
      return info;
    } catch (error) {
      console.error('[EmailService] Send failed:', error.message);
      // Non-blocking
    }
  },

  async sendTaskAssignment({ toEmail, assigneeName, taskTitle, projectName, taskUrl }) {
    return this.sendMail({
      to:      toEmail,
      subject: `[NexBoard] Task assigned: ${taskTitle}`,
      html: `
        <h2>Hi ${assigneeName},</h2>
        <p>You have been assigned to the task <strong>${taskTitle}</strong> in project <strong>${projectName}</strong>.</p>
        <a href="${taskUrl}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;">View Task</a>
        <p>— NexBoard</p>
      `,
    });
  },

  async sendDueSoonReminder({ toEmail, assigneeName, taskTitle, dueDate, taskUrl }) {
    return this.sendMail({
      to:      toEmail,
      subject: `[NexBoard] Task due soon: ${taskTitle}`,
      html: `
        <h2>Hi ${assigneeName},</h2>
        <p>The task <strong>${taskTitle}</strong> is due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
        <a href="${taskUrl}" style="display:inline-block;padding:10px 20px;background:#f59e0b;color:#fff;border-radius:6px;text-decoration:none;">View Task</a>
        <p>— NexBoard</p>
      `,
    });
  },
};

module.exports = emailService;

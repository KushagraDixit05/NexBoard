const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR, MAX_FILE_SIZE } = require('../config/env');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const ALLOWED_TYPES = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar|csv|mp4|webm/;

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const extValid  = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = ALLOWED_TYPES.test(file.mimetype);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed.`), false);
    }
  },
});

module.exports = { upload };

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Safe upload dir relative to backend root (not cwd)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = (path.extname(file.originalname) || '').toLowerCase();
  if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXT.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: Photos (JPG, PNG, WebP) and Videos (MP4, MOV)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE // 100MB limit covers both, but we can check mime in filter if needed
  }
});

module.exports = upload;

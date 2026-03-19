const express = require('express');
const router = express.Router();
const momentController = require('../controllers/momentController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 配置朋友圈图片上传
const momentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/moments');
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'moment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const momentUpload = multer({
  storage: momentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 9 // 最多9张图片
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只支持图片格式'));
  }
});

// 所有路由都需要认证
router.use(auth);

// 朋友圈路由
router.post('/', momentController.createMoment);
router.get('/', momentController.getMoments);
router.get('/my', momentController.getMyMoments);
router.delete('/:id', momentController.deleteMoment);
router.post('/:id/like', momentController.likeMoment);
router.delete('/:id/like', momentController.unlikeMoment);
router.get('/:id/comments', momentController.getComments);
router.post('/:id/comments', momentController.createComment);
router.delete('/:id/comments/:comment_id', momentController.deleteComment);
router.post('/upload/image', momentUpload.array('images', 9), momentController.uploadMomentImage);

module.exports = router;

const express = require('express');
const router = express.Router();
const shortVideoController = require('../controllers/shortVideoController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 配置视频上传
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/videos');
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('只支持视频格式'));
  }
});

// 所有路由都需要认证
router.use(auth);

// 短视频路由
router.get('/packages', shortVideoController.getPackages);
router.post('/packages/buy', shortVideoController.buyPackage);
router.get('/package/check', shortVideoController.checkUserPackage);
router.post('/upload', videoUpload.single('video'), shortVideoController.uploadVideo);
router.get('/my', shortVideoController.getMyVideos);
router.get('/recommended', shortVideoController.getRecommendedVideos);
router.get('/user/:user_id', shortVideoController.getVideosByUserId);
router.delete('/:id', shortVideoController.deleteVideo);
router.post('/:id/watch', shortVideoController.watchVideo);

module.exports = router;

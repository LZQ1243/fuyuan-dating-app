const express = require('express');
const router = express.Router();
const liveRoomController = require('../controllers/liveRoomController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 配置直播间封面上传
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/live-covers');
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const coverUpload = multer({
  storage: coverStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只支持图片格式'));
  }
});

// 公开路由
router.get('/', liveRoomController.getLiveRooms);
router.get('/:room_id', liveRoomController.getLiveRoomDetail);

// 需要认证的路由
router.use(auth);

// 直播间管理
router.post('/', liveRoomController.createLiveRoom);
router.post('/:room_id/start', liveRoomController.startLive);
router.post('/:room_id/end', liveRoomController.endLive);
router.get('/my/rooms', liveRoomController.getMyLiveRooms);

// 观众操作
router.post('/:room_id/join', liveRoomController.joinLiveRoom);
router.post('/:room_id/leave', liveRoomController.leaveLiveRoom);
router.post('/:room_id/like', liveRoomController.likeLiveRoom);

// 评论
router.post('/:room_id/comments', liveRoomController.sendComment);
router.get('/:room_id/comments', liveRoomController.getComments);

// 上传封面
router.post('/upload/cover', coverUpload.single('cover'), liveRoomController.uploadCover);

module.exports = router;

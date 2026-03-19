const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads')
const audioDir = path.join(uploadDir, 'audio')
const videoDir = path.join(uploadDir, 'video')
const imageDir = path.join(uploadDir, 'images')

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

ensureDir(audioDir)
ensureDir(videoDir)
ensureDir(imageDir)

// 语音文件存储配置
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

// 视频文件存储配置
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

// 图片文件存储配置
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

// 文件类型验证
const audioFileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('只支持音频文件'), false)
  }
}

const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('只支持视频文件'), false)
  }
}

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('只支持图片文件'), false)
  }
}

// 上传中间件
const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
})

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  }
})

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
})

// 删除文件
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../uploads', filePath)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  } catch (error) {
    console.error('删除文件失败:', error)
  }
}

module.exports = {
  uploadAudio,
  uploadVideo,
  uploadImage,
  deleteFile,
  uploadDir
}

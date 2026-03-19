const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { uploadAudio } = require('../utils/upload')

// 上传语音消息
router.post('/upload', authMiddleware, uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传音频文件'
      })
    }

    const { duration, fileSize } = req.body

    // 返回语音信息
    res.json({
      success: true,
      data: {
        id: req.file.filename,
        filePath: `/uploads/audio/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        duration: parseInt(duration) || 0,
        uploadedAt: new Date()
      }
    })
  } catch (error) {
    console.error('上传语音失败:', error)
    res.status(500).json({
      success: false,
      error: '上传失败'
    })
  }
})

// 删除语音
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    // 删除文件
    const { deleteFile } = require('../utils/upload')
    deleteFile(`audio/${id}`)

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除语音失败:', error)
    res.status(500).json({
      success: false,
      error: '删除失败'
    })
  }
})

module.exports = router

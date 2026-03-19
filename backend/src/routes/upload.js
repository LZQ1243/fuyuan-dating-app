const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const logger = require('../utils/logger');

// 上传单个文件
router.post('/single', uploadSingle('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未找到文件'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    logger.info(`文件上传成功: ${req.file.originalname}`);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('文件上传失败:', error);
    res.status(500).json({
      code: 500,
      message: '上传失败'
    });
  }
});

// 上传多个文件
router.post('/multiple', uploadMultiple('files', 9), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '未找到文件'
      });
    }

    const files = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size
    }));

    logger.info(`多文件上传成功: ${files.length}个文件`);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        files
      }
    });
  } catch (error) {
    logger.error('多文件上传失败:', error);
    res.status(500).json({
      code: 500,
      message: '上传失败'
    });
  }
});

// 通用上传路由
router.post('/', uploadSingle('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未找到文件'
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    logger.info(`文件上传成功: ${req.file.originalname}`);

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('文件上传失败:', error);
    res.status(500).json({
      code: 500,
      message: '上传失败'
    });
  }
});

module.exports = router;

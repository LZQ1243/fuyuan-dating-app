const express = require('express');
const router = express.Router();
const { checkSensitive, addSensitiveWord, removeSensitiveWord, getAllSensitiveWords, batchAddSensitiveWords } = require('../utils/sensitiveFilter');
const { authMiddleware } = require('../middleware/auth');

/**
 * 获取所有敏感词（需要管理员权限）
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const words = getAllSensitiveWords();
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        words,
        count: words.length
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取失败',
      error: error.message
    });
  }
});

/**
 * 添加敏感词
 */
router.post('/add', authMiddleware, (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word || word.trim().length === 0) {
      return res.status(400).json({
        code: 400,
        message: '敏感词不能为空'
      });
    }
    
    const success = addSensitiveWord(word.trim());
    
    if (success) {
      res.json({
        code: 200,
        message: '添加成功'
      });
    } else {
      res.status(400).json({
        code: 400,
        message: '敏感词已存在'
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '添加失败',
      error: error.message
    });
  }
});

/**
 * 批量添加敏感词
 */
router.post('/batch-add', authMiddleware, (req, res) => {
  try {
    const { words } = req.body;
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '参数错误'
      });
    }
    
    const result = batchAddSensitiveWords(words);
    
    if (result.success) {
      res.json({
        code: 200,
        message: result.message,
        data: {
          added: result.added,
          skipped: result.skipped
        }
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '批量添加失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '批量添加失败',
      error: error.message
    });
  }
});

/**
 * 删除敏感词
 */
router.delete('/remove', authMiddleware, (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word) {
      return res.status(400).json({
        code: 400,
        message: '敏感词不能为空'
      });
    }
    
    const success = removeSensitiveWord(word.trim());
    
    if (success) {
      res.json({
        code: 200,
        message: '删除成功'
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '敏感词不存在'
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '删除失败',
      error: error.message
    });
  }
});

/**
 * 检查内容（公开接口）
 */
router.post('/check', (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        code: 400,
        message: '内容不能为空'
      });
    }
    
    const result = checkSensitive(content);
    
    res.json({
      code: 200,
      message: result.hasSensitive ? '内容包含敏感词' : '内容合规',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '检查失败',
      error: error.message
    });
  }
});

/**
 * 重新加载敏感词库
 */
router.post('/reload', authMiddleware, (req, res) => {
  try {
    const { reloadSensitiveWords } = require('../utils/sensitiveFilter');
    reloadSensitiveWords();
    
    res.json({
      code: 200,
      message: '重新加载成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '重新加载失败',
      error: error.message
    });
  }
});

module.exports = router;

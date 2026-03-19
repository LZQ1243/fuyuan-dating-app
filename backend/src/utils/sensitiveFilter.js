const logger = require('./logger');
const fs = require('fs');
const path = require('path');

// 敏感词列表
let sensitiveWords = [];

/**
 * 加载敏感词库
 */
const loadSensitiveWords = () => {
  try {
    const filePath = path.join(__dirname, '../../config/sensitive-words.txt');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // 每行一个词，去除空行和空格
      sensitiveWords = content.split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      logger.info(`已加载 ${sensitiveWords.length} 个敏感词`);
    } else {
      logger.warn('敏感词文件不存在，使用默认敏感词');
      sensitiveWords = [
        '已婚', '诈骗', '赌博', '色情', '暴力',
        '毒品', '枪支', '炸弹', '卖淫', '嫖娼',
        '换妻', '换夫', '出轨', '一夜情', '包养',
        '小三', '二奶', '小姐', '鸭子', '援交',
        '微信', 'QQ', 'QQ群', '加我微信', '加我QQ'
      ];
    }
  } catch (error) {
    logger.error('加载敏感词失败:', error);
    sensitiveWords = [];
  }
};

/**
 * 检查文本是否包含敏感词
 * @param {string} text - 待检查文本
 * @returns {object} 检测结果
 */
const checkSensitive = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      hasSensitive: false,
      words: []
    };
  }

  const foundWords = [];
  const lowerText = text.toLowerCase();

  // 检查敏感词
  for (const word of sensitiveWords) {
    if (lowerText.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  }

  // 检查手机号模式
  const phoneRegex = /1[3-9]\d{9}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    foundWords.push('手机号');
  }

  // 检查微信号模式
  const wechatRegex = /微信[：:]\s*[a-zA-Z0-9_-]{6,20}/gi;
  const wechatMatch = text.match(wechatRegex);
  if (wechatMatch) {
    foundWords.push('微信号');
  }

  // 检查QQ号模式
  const qqRegex = /QQ[：:]\s*\d{5,12}/gi;
  const qqMatch = text.match(qqRegex);
  if (qqMatch) {
    foundWords.push('QQ号');
  }

  return {
    hasSensitive: foundWords.length > 0,
    words: foundWords,
    message: foundWords.length > 0 
      ? `内容包含敏感信息：${foundWords.join('、')}` 
      : '内容合规'
  };
};

/**
 * 过滤敏感词（将敏感词替换为***）
 * @param {string} text - 待过滤文本
 * @param {string} replacement - 替换字符，默认为***
 * @returns {string} 过滤后的文本
 */
const filterSensitive = (text, replacement = '***') => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let filteredText = text;

  // 过滤敏感词
  for (const word of sensitiveWords) {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, replacement);
  }

  // 过滤手机号
  const phoneRegex = /1[3-9]\d{9}/g;
  filteredText = filteredText.replace(phoneRegex, replacement);

  // 过滤微信号
  const wechatRegex = /微信[：:]\s*[a-zA-Z0-9_-]{6,20}/gi;
  filteredText = filteredText.replace(wechatRegex, '微信***');

  // 过滤QQ号
  const qqRegex = /QQ[：:]\s*\d{5,12}/gi;
  filteredText = filteredText.replace(qqRegex, 'QQ***');

  return filteredText;
};

/**
 * 添加敏感词
 * @param {string} word - 要添加的敏感词
 * @returns {boolean} 是否添加成功
 */
const addSensitiveWord = (word) => {
  if (!word || typeof word !== 'string' || word.trim().length === 0) {
    return false;
  }

  word = word.trim().toLowerCase();

  // 检查是否已存在
  if (sensitiveWords.includes(word)) {
    return false;
  }

  sensitiveWords.push(word);
  saveSensitiveWords();
  logger.info(`添加敏感词: ${word}`);
  return true;
};

/**
 * 批量添加敏感词
 * @param {Array<string>} words - 要添加的敏感词数组
 * @returns {object} 添加结果
 */
const batchAddSensitiveWords = (words) => {
  let added = 0;
  let skipped = 0;

  if (!Array.isArray(words)) {
    return { success: false, message: '参数错误' };
  }

  for (const word of words) {
    if (addSensitiveWord(word)) {
      added++;
    } else {
      skipped++;
    }
  }

  return {
    success: true,
    message: `成功添加${added}个，跳过${skipped}个`,
    added,
    skipped
  };
};

/**
 * 删除敏感词
 * @param {string} word - 要删除的敏感词
 * @returns {boolean} 是否删除成功
 */
const removeSensitiveWord = (word) => {
  if (!word) {
    return false;
  }

  word = word.trim().toLowerCase();
  const index = sensitiveWords.indexOf(word);

  if (index === -1) {
    return false;
  }

  sensitiveWords.splice(index, 1);
  saveSensitiveWords();
  logger.info(`删除敏感词: ${word}`);
  return true;
};

/**
 * 获取所有敏感词
 * @returns {Array<string>} 敏感词列表
 */
const getAllSensitiveWords = () => {
  return [...sensitiveWords];
};

/**
 * 保存敏感词到文件
 */
const saveSensitiveWords = () => {
  try {
    const filePath = path.join(__dirname, '../../config/sensitive-words.txt');
    const content = sensitiveWords.join('\n');
    fs.writeFileSync(filePath, content, 'utf-8');
    logger.info(`敏感词已保存，共${sensitiveWords.length}个`);
  } catch (error) {
    logger.error('保存敏感词失败:', error);
  }
};

/**
 * 重新加载敏感词库
 */
const reloadSensitiveWords = () => {
  loadSensitiveWords();
  logger.info('敏感词库已重新加载');
};

// 初始化加载
loadSensitiveWords();

module.exports = {
  checkSensitive,
  filterSensitive,
  addSensitiveWord,
  batchAddSensitiveWords,
  removeSensitiveWord,
  getAllSensitiveWords,
  reloadSensitiveWords,
};

const AIService = require('../services/AIService');
const logger = require('../utils/logger');

// 语音播报引导
exports.playVoiceGuide = async (req, res) => {
  try {
    const { step } = req.body;

    const guides = {
      1: '欢迎使用本平台，请填写基础信息',
      2: '请上传您的身份证件进行实名认证',
      3: '请进行人脸识别验证',
      4: '请签署单身承诺书',
      5: '注册完成，欢迎使用我们的服务'
    };

    const text = guides[step] || '请按照提示完成操作';

    // 调用TTS服务
    const result = await AIService.textToSpeech(text);

    if (result.success) {
      // 返回音频数据或URL
      res.json({
        code: 200,
        message: '语音播报成功',
        data: {
          audio_url: result.audio_url,
          text
        }
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '语音播报失败',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('语音播报失败:', error);
    res.status(500).json({
      code: 500,
      message: '语音播报失败'
    });
  }
};

// 语音转文字（实时ASR）
exports.speechToText = async (req, res) => {
  try {
    const { audio_data } = req.body;

    // 调用ASR服务
    const result = await AIService.speechToText(audio_data);

    if (result.success) {
      res.json({
        code: 200,
        message: '识别成功',
        data: {
          text: result.text
        }
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '语音识别失败',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('语音识别失败:', error);
    res.status(500).json({
      code: 500,
      message: '语音识别失败'
    });
  }
};

// 实时翻译（WebSocket消息）
exports.handleWebSocketMessage = async (socket, message) => {
  try {
    const { type, data } = message;

    if (type === 'speech_to_text') {
      // 实时语音转文字
      const result = await AIService.speechToText(data.audio_data);

      socket.emit('speech_result', {
        success: result.success,
        text: result.success ? result.text : '',
        error: result.error
      });
    } else if (type === 'text_to_speech') {
      // 实时文字转语音
      const result = await AIService.textToSpeech(data.text);

      socket.emit('speech_audio', {
        success: result.success,
        audio_data: result.success ? result.audioData : null,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('WebSocket消息处理失败:', error);
    socket.emit('error', {
      message: '处理失败',
      error: error.message
    });
  }
};

// 敏感词检测接口
exports.checkSensitiveContent = async (req, res) => {
  try {
    const { content } = req.body;

    const result = await AIService.detectSensitiveContent(content);

    res.json({
      code: 200,
      message: '检测完成',
      data: result
    });
  } catch (error) {
    logger.error('敏感词检测失败:', error);
    res.status(500).json({
      code: 500,
      message: '检测失败'
    });
  }
};

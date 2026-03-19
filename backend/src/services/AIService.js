const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.aliyunASR = {
      appKey: process.env.ALIYUN_ASR_APPKEY || '',
      token: process.env.ALIYUN_ASR_TOKEN || ''
    };

    this.tencentFace = {
      apiKey: process.env.TENCENT_FACE_API_KEY || ''
    };
  }

  // 语音转文字 (ASR)
  async speechToText(audioData) {
    try {
      // 这里使用阿里云ASR API
      const response = await axios.post(
        'https://nls-meta.cn-shanghai.aliyuncs.com/uploadgateway',
        audioData,
        {
          headers: {
            'X-NLS-Token': this.aliyunASR.token,
            'Content-Type': 'application/octet-stream'
          }
        }
      );

      logger.info('语音识别成功');
      return {
        success: true,
        text: response.data.Result
      };
    } catch (error) {
      logger.error('语音识别失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 文字转语音 (TTS)
  async textToSpeech(text, voice = 'xiaoyun') {
    try {
      // 这里使用阿里云TTS API
      const response = await axios.post(
        'https://nls-meta.cn-shanghai.aliyuncs.com/serve/v1/tts',
        {
          appkey: this.aliyunASR.appKey,
          token: this.aliyunASR.token,
          text: text,
          format: 'mp3',
          sample_rate: 16000,
          voice: voice,
          volume: 50,
          speech_rate: 0,
          pitch_rate: 0
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      logger.info('语音合成成功');
      return {
        success: true,
        audioData: response.data
      };
    } catch (error) {
      logger.error('语音合成失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 人脸识别
  async faceDetection(imageData) {
    try {
      // 这里使用腾讯云人脸检测API
      const response = await axios.post(
        'https://faceid.tencentcloudapi.com/detect_faces',
        {
          ImageBase64: imageData,
          NeedFaceAttributes: 1,
          NeedFaceQuality: 1
        },
        {
          params: {
            Action: 'DetectFace'
          },
          headers: {
            'Authorization': this.tencentFace.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('人脸检测成功');
      return {
        success: true,
        faces: response.data.FaceInfos
      };
    } catch (error) {
      logger.error('人脸检测失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 人脸比对 (用于实名认证）
  async faceCompare(image1Data, image2Data) {
    try {
      const response = await axios.post(
        'https://faceid.tencentcloudapi.com/face_compare',
        {
          ImageA: image1Data,
          ImageB: image2Data
        },
        {
          params: {
            Action: 'CompareFace'
          },
          headers: {
            'Authorization': this.tencentFace.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const { Score, IsMatch } = response.data;
      const match = IsMatch === 1 && Score > 80;

      logger.info(`人脸比对完成: ${match ? '匹配' : '不匹配'}, 分数: ${Score}`);
      return {
        success: true,
        match,
        score: Score
      };
    } catch (error) {
      logger.error('人脸比对失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 敏感词检测
  async detectSensitiveContent(content) {
    try {
      // 基础敏感词库
      const sensitiveWords = [
        '已婚', '诈骗', '赌博', '色情',
        '歧视', '侮辱', '暴力', '政治',
        '刷单', '兼职', '日赚', '高薪',
        '裸聊', '约炮', '黄色'
      ];

      const foundWords = [];
      for (const word of sensitiveWords) {
        if (content.includes(word)) {
          foundWords.push(word);
        }
      }

      // 检测联系方式
      const contactPatterns = [
        /1[3-9]\d{9}/g,
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        /微信|VX|QQ/i
      ];

      for (const pattern of contactPatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          foundWords.push(...matches);
        }
      }

      if (foundWords.length > 0) {
        logger.info('检测到敏感内容:', foundWords);
        return {
          blocked: true,
          reason: `包含敏感词或联系方式: ${foundWords.join(', ')}`
        };
      }

      return {
        blocked: false
      };
    } catch (error) {
      logger.error('敏感词检测失败:', error);
      return {
        blocked: false,
        error: error.message
      };
    }
  }

  // 查询婚姻状态 (模拟）
  async queryMarriageStatus(idCard) {
    try {
      // 这里应该调用实际的政务API查询婚姻状态
      // 目前返回模拟数据
      const statuses = ['未婚', '已婚', '离异', '丧偶'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      logger.info(`查询婚姻状态: ${idCard.substring(0, 6)}****${idCard.substring(14)} - ${randomStatus}`);

      return {
        success: true,
        status: randomStatus
      };
    } catch (error) {
      logger.error('查询婚姻状态失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AIService();

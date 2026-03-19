const request = require('supertest');
const { app } = require('../src/app');
const User = require('../src/models/User');

describe('Accessibility API Tests', () => {
  let userToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '18800000016',
        password: 'Test123!@#'
      });
    userToken = res.body.data.token;
  });

  describe('GET /api/accessibility/settings - 获取无障碍设置', () => {
    it('应该成功获取无障碍设置', async () => {
      const res = await request(app)
        .get('/api/accessibility/settings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('fontSize');
      expect(res.body.data).toHaveProperty('voiceEnabled');
      expect(res.body.data).toHaveProperty('highContrast');
    });
  });

  describe('PUT /api/accessibility/settings - 更新无障碍设置', () => {
    it('应该成功更新字体大小', async () => {
      const res = await request(app)
        .put('/api/accessibility/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ fontSize: 'large' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该成功启用语音朗读', async () => {
      const res = await request(app)
        .put('/api/accessibility/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ voiceEnabled: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该成功启用高对比度', async () => {
      const res = await request(app)
        .put('/api/accessibility/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ highContrast: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该拒绝无效的字体大小', async () => {
      const res = await request(app)
        .put('/api/accessibility/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ fontSize: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/accessibility/voice/speak - 语音朗读', () => {
    it('应该成功朗读文本', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/speak')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ text: '这是一段测试文本' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该支持设置语音速度', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/speak')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: '测试语音速度',
          rate: 1.5
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该支持设置语音音调', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/speak')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: '测试语音音调',
          pitch: 1.2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该支持设置语音音量', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/speak')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: '测试语音音量',
          volume: 0.8
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该拒绝无效的音量值', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/speak')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: '测试',
          volume: 2.0
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/accessibility/voice/stop - 停止朗读', () => {
    it('应该成功停止朗读', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/stop')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/accessibility/voice/pause - 暂停朗读', () => {
    it('应该成功暂停朗读', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/pause')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/accessibility/voice/resume - 继续朗读', () => {
    it('应该成功继续朗读', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/resume')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/accessibility/voice/languages - 获取支持的语言', () => {
    it('应该成功获取支持的语言列表', async () => {
      const res = await request(app)
        .get('/api/accessibility/voice/languages')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/accessibility/voice/set-language - 设置语音语言', () => {
    it('应该成功设置语音语言', async () => {
      const res = await request(app)
        .post('/api/accessibility/voice/set-language')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ language: 'zh-CN' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/accessibility/screen-reader - 屏幕阅读器状态', () => {
    it('应该成功获取屏幕阅读器状态', async () => {
      const res = await request(app)
        .get('/api/accessibility/screen-reader')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enabled');
    });
  });

  describe('PUT /api/accessibility/screen-reader - 更新屏幕阅读器设置', () => {
    it('应该成功启用屏幕阅读器', async () => {
      const res = await request(app)
        .put('/api/accessibility/screen-reader')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/accessibility/captions - 字幕设置', () => {
    it('应该成功获取字幕设置', async () => {
      const res = await request(app)
        .get('/api/accessibility/captions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enabled');
      expect(res.body.data).toHaveProperty('fontSize');
      expect(res.body.data).toHaveProperty('position');
    });
  });

  describe('PUT /api/accessibility/captions - 更新字幕设置', () => {
    it('应该成功启用字幕', async () => {
      const res = await request(app)
        .put('/api/accessibility/captions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该成功设置字幕位置', async () => {
      const res = await request(app)
        .put('/api/accessibility/captions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ position: 'bottom' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/accessibility/color-blind - 色盲模式', () => {
    it('应该成功获取色盲模式设置', async () => {
      const res = await request(app)
        .get('/api/accessibility/color-blind')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enabled');
      expect(res.body.data).toHaveProperty('type');
    });
  });

  describe('PUT /api/accessibility/color-blind - 更新色盲模式', () => {
    it('应该成功启用色盲模式', async () => {
      const res = await request(app)
        .put('/api/accessibility/color-blind')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true, type: 'protanopia' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该拒绝无效的色盲类型', async () => {
      const res = await request(app)
        .put('/api/accessibility/color-blind')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true, type: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/accessibility/reduced-motion - 减少动画', () => {
    it('应该成功获取减少动画设置', async () => {
      const res = await request(app)
        .get('/api/accessibility/reduced-motion')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enabled');
    });
  });

  describe('PUT /api/accessibility/reduced-motion - 更新减少动画设置', () => {
    it('应该成功启用减少动画', async () => {
      const res = await request(app)
        .put('/api/accessibility/reduced-motion')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/accessibility/reset - 重置所有设置', () => {
    it('应该成功重置所有无障碍设置', async () => {
      const res = await request(app)
        .post('/api/accessibility/reset')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

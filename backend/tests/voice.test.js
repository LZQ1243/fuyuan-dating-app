const request = require('supertest');
const { app } = require('../src/app');
const User = require('../src/models/User');
const Message = require('../src/models/Message');

describe('Voice Message API Tests', () => {
  let userToken;
  let recipientId;

  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '18800000013',
        password: 'Test123!@#'
      });
    userToken = userRes.body.data.token;

    const recipientRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '18800000014',
        password: 'Test123!@#'
      });
    recipientId = recipientRes.body.data.user._id;
  });

  describe('POST /api/messages/voice/send - 发送语音消息', () => {
    it('应该成功发送语音消息', async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 15,
          audioUrl: 'https://example.com/audio.mp3',
          fileSize: 102400
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('messageId');
    });

    it('应该验证音频URL格式', async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'invalid-url'
        });

      expect(res.status).toBe(400);
    });

    it('应该验证语音时长限制', async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 300,
          audioUrl: 'https://example.com/audio.mp3'
        });

      expect(res.status).toBe(400);
    });

    it('应该验证文件大小限制', async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'https://example.com/audio.mp3',
          fileSize: 104857600 // 100MB
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/messages/voice/upload - 上传语音文件', () => {
    it('应该成功上传语音文件', async () => {
      const res = await request(app)
        .post('/api/messages/voice/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('audio', Buffer.from('mock audio data'), 'test.mp3');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('audioUrl');
      expect(res.body.data).toHaveProperty('duration');
    });

    it('应该验证文件格式', async () => {
      const res = await request(app)
        .post('/api/messages/voice/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('audio', Buffer.from('mock data'), 'test.txt');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/messages/voice/:id - 获取语音消息', () => {
    let messageId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'https://example.com/audio2.mp3'
        });
      messageId = res.body.data.messageId;
    });

    it('应该成功获取语音消息', async () => {
      const res = await request(app)
        .get(`/api/messages/voice/${messageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('audioUrl');
      expect(res.body.data).toHaveProperty('duration');
    });
  });

  describe('POST /api/messages/voice/:id/transcribe - 语音转文字', () => {
    let messageId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'https://example.com/audio3.mp3'
        });
      messageId = res.body.data.messageId;
    });

    it('应该成功将语音转换为文字', async () => {
      const res = await request(app)
        .post(`/api/messages/voice/${messageId}/transcribe`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('text');
    });
  });

  describe('POST /api/messages/voice/:id/play - 播放语音', () => {
    let messageId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'https://example.com/audio4.mp3'
        });
      messageId = res.body.data.messageId;
    });

    it('应该成功标记语音为已播放', async () => {
      const res = await request(app)
        .post(`/api/messages/voice/${messageId}/play`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/messages/voice/:id - 删除语音消息', () => {
    let messageId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'https://example.com/audio5.mp3'
        });
      messageId = res.body.data.messageId;
    });

    it('应该成功删除语音消息', async () => {
      const res = await request(app)
        .delete(`/api/messages/voice/${messageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/messages/voice/list - 获取语音消息列表', () => {
    it('应该成功获取语音消息列表', async () => {
      const res = await request(app)
        .get('/api/messages/voice/list')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ recipientId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const res = await request(app)
        .get('/api/messages/voice/list')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ recipientId, page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('messages');
      expect(res.body.data).toHaveProperty('total');
    });
  });

  describe('POST /api/messages/voice/:id/download - 下载语音', () => {
    let messageId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'https://example.com/audio6.mp3'
        });
      messageId = res.body.data.messageId;
    });

    it('应该成功下载语音文件', async () => {
      const res = await request(app)
        .post(`/api/messages/voice/${messageId}/download`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('downloadUrl');
    });
  });

  describe('POST /api/messages/voice/forward - 转发语音消息', () => {
    let messageId;
    let newRecipientId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/messages/voice/send')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientId,
          duration: 10,
          audioUrl: 'https://example.com/audio7.mp3'
        });
      messageId = res.body.data.messageId;

      const newRes = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000015',
          password: 'Test123!@#'
        });
      newRecipientId = newRes.body.data.user._id;
    });

    it('应该成功转发语音消息', async () => {
      const res = await request(app)
        .post('/api/messages/voice/forward')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          messageId,
          newRecipientId
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

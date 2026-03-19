const request = require('supertest');
const { app } = require('../src/app');
const LiveRoom = require('../src/models/LiveRoom');
const User = require('../src/models/User');

describe('LiveRoom API Tests', () => {
  let hostToken;
  let viewerToken;
  let roomId;

  beforeAll(async () => {
    // 创建主播账户
    const hostRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '18800000011',
        password: 'Test123!@#'
      });
    hostToken = hostRes.body.data.token;

    // 创建观众账户
    const viewerRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '18800000012',
        password: 'Test123!@#'
      });
    viewerToken = viewerRes.body.data.token;
  });

  describe('POST /api/liveroom/create - 创建直播间', () => {
    it('应该成功创建直播间', async () => {
      const res = await request(app)
        .post('/api/liveroom/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: '测试直播间',
          cover: 'https://example.com/cover.jpg',
          category: '相亲'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('roomId');
      roomId = res.body.data.roomId;
    });

    it('应该验证必填字段', async () => {
      const res = await request(app)
        .post('/api/liveroom/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('应该拒绝重复创建直播间', async () => {
      await request(app)
        .post('/api/liveroom/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: '另一个直播间',
          cover: 'https://example.com/cover2.jpg'
        });

      const res = await request(app)
        .post('/api/liveroom/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: '第三个直播间',
          cover: 'https://example.com/cover3.jpg'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/liveroom/list - 获取直播间列表', () => {
    it('应该成功获取直播间列表', async () => {
      const res = await request(app)
        .get('/api/liveroom/list');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const res = await request(app)
        .get('/api/liveroom/list?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('rooms');
      expect(res.body.data).toHaveProperty('total');
    });

    it('应该支持按分类筛选', async () => {
      const res = await request(app)
        .get('/api/liveroom/list?category=相亲');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该支持按状态筛选', async () => {
      const res = await request(app)
        .get('/api/liveroom/list?status=live');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/liveroom/:roomId - 获取直播间详情', () => {
    it('应该成功获取直播间详情', async () => {
      const res = await request(app)
        .get(`/api/liveroom/${roomId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('room');
      expect(res.body.data.room).toHaveProperty('viewers');
    });

    it('应该返回观众列表', async () => {
      const res = await request(app)
        .get(`/api/liveroom/${roomId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.room).toHaveProperty('viewers');
    });
  });

  describe('POST /api/liveroom/:roomId/join - 加入直播间', () => {
    it('应该成功加入直播间', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/join`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('sessionId');
    });

    it('应该增加观众数量', async () => {
      const res = await request(app)
        .get(`/api/liveroom/${roomId}`);

      expect(res.body.data.room.viewers).toBeGreaterThan(0);
    });
  });

  describe('POST /api/liveroom/:roomId/leave - 离开直播间', () => {
    it('应该成功离开直播间', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/leave`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/liveroom/:roomId/send-gift - 发送礼物', () => {
    it('应该成功发送礼物', async () => {
      await request(app)
        .post(`/api/liveroom/${roomId}/join`)
        .set('Authorization', `Bearer ${viewerToken}`);

      const res = await request(app)
        .post(`/api/liveroom/${roomId}/send-gift`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          giftId: 'gift_001',
          count: 1
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该验证礼物库存', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/send-gift`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          giftId: 'invalid_gift',
          count: 1000
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/liveroom/:roomId/start - 开始直播', () => {
    it('应该成功开始直播', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('只有主播可以开始直播', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/start`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/liveroom/:roomId/stop - 结束直播', () => {
    it('应该成功结束直播', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/stop`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/liveroom/:roomId/gifts - 获取礼物记录', () => {
    it('应该成功获取礼物记录', async () => {
      const res = await request(app)
        .get(`/api/liveroom/${roomId}/gifts`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const res = await request(app)
        .get(`/api/liveroom/${roomId}/gifts?page=1&limit=10`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('gifts');
      expect(res.body.data).toHaveProperty('total');
    });
  });

  describe('POST /api/liveroom/:roomId/mute - 禁言用户', () => {
    it('主播应该能够禁言观众', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/mute`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: '123456789012345678901234', duration: 60 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/liveroom/:roomId/kick - 踢出用户', () => {
    it('主播应该能够踢出观众', async () => {
      const res = await request(app)
        .post(`/api/liveroom/${roomId}/kick`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: '123456789012345678901234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Match API Tests', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    // 创建测试用户
    const testUser = await User.create({
      phone: '13900139000',
      password: 'hashed_password',
      nickname: '测试用户',
      gender: 'male',
      age: 25
    });
    userId = testUser._id;
    userToken = 'test_token_' + userId;
  });

  test('GET /api/match/recommendations - 获取匹配推荐', async () => {
    const res = await request(app)
      .get('/api/match/recommendations')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ page: 1, limit: 10 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/match/like - 喜欢用户', async () => {
    const targetUserId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post('/api/match/like')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ targetUserId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/match/dislike - 不喜欢用户', async () => {
    const targetUserId = '507f1f77bcf86cd799439012';
    const res = await request(app)
      .post('/api/match/dislike')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ targetUserId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/match/history - 获取匹配历史', async () => {
    const res = await request(app)
      .get('/api/match/history')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ page: 1, limit: 20 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/match/stats - 获取匹配统计', async () => {
    const res = await request(app)
      .get('/api/match/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});

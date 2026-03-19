const request = require('supertest');
const app = require('../src/app');

describe('Config API Tests', () => {
  let adminToken;

  beforeAll(() => {
    adminToken = 'admin_test_token';
  });

  test('GET /api/config/all - 获取所有配置', async () => {
    const res = await request(app)
      .get('/api/config/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/config/:key - 获取单个配置', async () => {
    const res = await request(app)
      .get('/api/config/match.max_daily_swipes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('match.max_daily_swipes');
  });

  test('POST /api/config - 创建配置', async () => {
    const res = await request(app)
      .post('/api/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        key: 'test.config',
        value: '100',
        description: '测试配置',
        category: 'test'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('test.config');
  });

  test('PUT /api/config/:key - 更新配置', async () => {
    const res = await request(app)
      .put('/api/config/match.max_daily_swipes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        value: '50',
        description: '每日最大滑动次数'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/config/validate - 验证配置', async () => {
    const res = await request(app)
      .post('/api/config/validate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        configs: [
          { key: 'test.config', value: '100' }
        ]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.valid)).toBe(true);
  });
});

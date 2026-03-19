const request = require('supertest');
const app = require('../src/app');

describe('Moments API Tests', () => {
  let userToken;

  beforeAll(() => {
    userToken = 'user_test_token';
  });

  test('POST /api/moments - 发布动态', async () => {
    const res = await request(app)
      .post('/api/moments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: '这是一条测试动态',
        images: ['image1.jpg', 'image2.jpg'],
        location: '北京市',
        visibility: 'public'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('这是一条测试动态');
  });

  test('GET /api/moments - 获取动态列表', async () => {
    const res = await request(app)
      .get('/api/moments')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ page: 1, limit: 10 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/moments/:id - 获取单条动态', async () => {
    const momentId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .get(`/api/moments/${momentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/moments/:id/like - 点赞动态', async () => {
    const momentId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post(`/api/moments/${momentId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/moments/:id/comment - 评论动态', async () => {
    const momentId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post(`/api/moments/${momentId}/comment`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: '这是一条测试评论'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('这是一条测试评论');
  });

  test('DELETE /api/moments/:id - 删除动态', async () => {
    const momentId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .delete(`/api/moments/${momentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

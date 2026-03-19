const request = require('supertest');
const app = require('../src/app');

describe('User API Tests', () => {
  let authToken;

  test('POST /api/users/register - 注册新用户', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        phone: '13800138000',
        password: 'test123456',
        nickname: '测试用户',
        gender: 'male'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.phone).toBe('13800138000');
  });

  test('POST /api/users/login - 用户登录', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        phone: '13800138000',
        password: 'test123456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  test('GET /api/users/profile - 获取用户信息', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phone).toBe('13800138000');
  });

  test('PUT /api/users/profile - 更新用户信息', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nickname: '更新后的用户',
        age: 25,
        occupation: '工程师'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nickname).toBe('更新后的用户');
  });

  test('POST /api/users/avatar - 上传头像', async () => {
    const res = await request(app)
      .post('/api/users/avatar')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', Buffer.from('test image content'), 'avatar.jpg');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

const request = require('supertest');
const { app } = require('../src/app');
const User = require('../src/models/User');

describe('Registration API Tests', () => {
  describe('POST /api/auth/register - 用户注册', () => {
    it('应该成功注册新用户', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000002',
          password: 'Test123!@#',
          verifyCode: '123456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
    });

    it('应该拒绝已存在的手机号', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000003',
          password: 'Test123!@#'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000003',
          password: 'Test123!@#'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('应该拒绝弱密码', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000004',
          password: '123'
        });

      expect(res.status).toBe(400);
    });

    it('应该拒绝无效的手机号格式', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '123',
          password: 'Test123!@#'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/registration/step1 - 第一步:基本信息', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000005',
          password: 'Test123!@#'
        });
      token = res.body.data.token;
    });

    it('应该成功保存基本信息', async () => {
      const res = await request(app)
        .post('/api/registration/step1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nickname: '测试用户',
          gender: 'male',
          birthDate: '1990-01-01'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该验证必填字段', async () => {
      const res = await request(app)
        .post('/api/registration/step1')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/registration/step2 - 第二步:个人资料', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000006',
          password: 'Test123!@#'
        });
      token = res.body.data.token;
    });

    it('应该成功保存个人资料', async () => {
      const res = await request(app)
        .post('/api/registration/step2')
        .set('Authorization', `Bearer ${token}`)
        .send({
          height: 175,
          weight: 65,
          education: '本科',
          occupation: '软件工程师',
          income: '20-30万'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该验证身高范围', async () => {
      const res = await request(app)
        .post('/api/registration/step2')
        .set('Authorization', `Bearer ${token}`)
        .send({
          height: 300
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/registration/step3 - 第三步:上传照片', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000007',
          password: 'Test123!@#'
        });
      token = res.body.data.token;
    });

    it('应该成功上传头像', async () => {
      const res = await request(app)
        .post('/api/registration/step3')
        .set('Authorization', `Bearer ${token}`)
        .send({
          avatar: 'https://example.com/avatar.jpg'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该支持上传多张照片', async () => {
      const res = await request(app)
        .post('/api/registration/step3')
        .set('Authorization', `Bearer ${token}`)
        .send({
          photos: [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
            'https://example.com/photo3.jpg'
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该限制照片数量', async () => {
      const photos = Array(15).fill('https://example.com/photo.jpg');
      const res = await request(app)
        .post('/api/registration/step3')
        .set('Authorization', `Bearer ${token}`)
        .send({ photos });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/registration/step4 - 第四步:匹配偏好', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000008',
          password: 'Test123!@#'
        });
      token = res.body.data.token;
    });

    it('应该成功保存匹配偏好', async () => {
      const res = await request(app)
        .post('/api/registration/step4')
        .set('Authorization', `Bearer ${token}`)
        .send({
          preferGender: 'female',
          ageRange: [20, 30],
          location: '北京'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该验证年龄范围', async () => {
      const res = await request(app)
        .post('/api/registration/step4')
        .set('Authorization', `Bearer ${token}`)
        .send({
          preferGender: 'female',
          ageRange: [50, 10]
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/registration/complete - 完成注册', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000009',
          password: 'Test123!@#'
        });
      token = res.body.data.token;
    });

    it('应该成功完成注册流程', async () => {
      const res = await request(app)
        .post('/api/registration/complete')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('完成');
    });
  });

  describe('GET /api/registration/status - 查询注册状态', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '18800000010',
          password: 'Test123!@#'
        });
      token = res.body.data.token;
    });

    it('应该返回当前注册步骤', async () => {
      const res = await request(app)
        .get('/api/registration/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('step');
      expect(res.body.data).toHaveProperty('completed');
    });
  });
});

const request = require('supertest');
const { app } = require('../src/app');
const User = require('../src/models/User');
const Certification = require('../src/models/Certification');

describe('Admin API Tests', () => {
  let adminToken;
  let userId;

  beforeAll(async () => {
    // 创建管理员账户并获取token
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '18800000000',
        password: 'Test123!@#',
        role: 'admin'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        phone: '18800000000',
        password: 'Test123!@#'
      });

    adminToken = loginRes.body.data.token;
  });

  describe('GET /api/admin/users - 获取用户列表', () => {
    it('应该成功获取用户列表', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('total');
    });

    it('应该支持按状态筛选', async () => {
      const res = await request(app)
        .get('/api/admin/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('无token应该返回401', async () => {
      const res = await request(app)
        .get('/api/admin/users');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/admin/users/:id/status - 更新用户状态', () => {
    beforeAll(async () => {
      const user = await User.create({
        phone: '18800000001',
        password: 'Test123!@#',
        nickname: '测试用户'
      });
      userId = user._id;
    });

    it('应该成功更新用户状态', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${userId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'banned' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该拒绝无效的状态值', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${userId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/certifications - 获取认证列表', () => {
    it('应该成功获取认证列表', async () => {
      const res = await request(app)
        .get('/api/admin/certifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该支持按状态筛选', async () => {
      const res = await request(app)
        .get('/api/admin/certifications?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/admin/certifications/:id/review - 审核认证', () => {
    let certificationId;

    beforeAll(async () => {
      const certification = await Certification.create({
        userId,
        type: 'id_card',
        status: 'pending',
        images: ['test.jpg']
      });
      certificationId = certification._id;
    });

    it('应该成功通过认证', async () => {
      const res = await request(app)
        .put(`/api/admin/certifications/${certificationId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved', remark: '认证通过' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该成功拒绝认证', async () => {
      const res = await request(app)
        .put(`/api/admin/certifications/${certificationId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected', remark: '资料不完整' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/stats - 获取统计数据', () => {
    it('应该成功获取统计数据', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('userCount');
      expect(res.body.data).toHaveProperty('matchCount');
      expect(res.body.data).toHaveProperty('messageCount');
    });

    it('应该支持日期范围查询', async () => {
      const res = await request(app)
        .get('/api/admin/stats?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/reports - 获取举报列表', () => {
    it('应该成功获取举报列表', async () => {
      const res = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该支持按状态筛选', async () => {
      const res = await request(app)
        .get('/api/admin/reports?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/admin/reports/:id/handle - 处理举报', () => {
    it('应该成功处理举报', async () => {
      const res = await request(app)
        .put('/api/admin/reports/123456789012345678901234/handle')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'resolved', action: 'warning' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

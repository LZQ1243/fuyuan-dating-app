/**
 * 分页功能测试
 * 测试所有分页相关的功能
 */

const request = require('supertest');
const app = require('../app');

describe('分页功能测试', () => {
  describe('基本分页', () => {
    test('应该返回第一页数据', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(10);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    test('应该正确处理分页参数', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 2, limit: 20 });

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(20);
    });

    test('应该默认返回第一页', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.body.pagination.page).toBe(1);
    });

    test('应该默认每页返回20条', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.body.pagination.limit).toBe(20);
    });
  });

  describe('分页边界', () => {
    test('应该处理page为0的情况', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('页码必须大于0');
    });

    test('应该处理负数page', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: -1 });

      expect(res.status).toBe(400);
    });

    test('应该处理过大的page', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 99999 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('页码超出范围');
    });

    test('应该处理limit为0的情况', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ limit: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('每页数量必须大于0');
    });

    test('应该处理过大的limit', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ limit: 1000 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('每页数量不能超过100');
    });
  });

  describe('分页信息', () => {
    test('应该返回总记录数', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10 });

      expect(res.body.pagination.total).toBeDefined();
      expect(typeof res.body.pagination.total).toBe('number');
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    test('应该返回总页数', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10 });

      expect(res.body.pagination.pages).toBeDefined();
      expect(typeof res.body.pagination.pages).toBe('number');
    });

    test('应该返回是否有下一页', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10 });

      expect(res.body.pagination.hasNext).toBeDefined();
      expect(typeof res.body.pagination.hasNext).toBe('boolean');
    });

    test('应该返回是否有上一页', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 2, limit: 10 });

      expect(res.body.pagination.hasPrev).toBeDefined();
      expect(typeof res.body.pagination.hasPrev).toBe('boolean');
      expect(res.body.pagination.hasPrev).toBe(true);
    });

    test('第一页应该没有上一页', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10 });

      expect(res.body.pagination.hasPrev).toBe(false);
    });
  });

  describe('排序功能', () => {
    test('应该支持按创建时间排序', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.pagination.sortBy).toBe('createdAt');
      expect(res.body.pagination.sortOrder).toBe('desc');
    });

    test('应该支持按更新时间排序', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10, sortBy: 'updatedAt', sortOrder: 'desc' });

      expect(res.body.pagination.sortBy).toBe('updatedAt');
    });

    test('应该支持按ID排序', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10, sortBy: '_id', sortOrder: 'asc' });

      expect(res.body.pagination.sortBy).toBe('_id');
      expect(res.body.pagination.sortOrder).toBe('asc');
    });
  });

  describe('过滤功能', () => {
    test('应该支持按状态过滤', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10, status: 'active' });

      expect(res.status).toBe(200);
      res.body.data.forEach(item => {
        expect(item.status).toBe('active');
      });
    });

    test('应该支持按类型过滤', async () => {
      const res = await request(app)
        .get('/api/moments')
        .query({ page: 1, limit: 10, type: 'image' });

      expect(res.status).toBe(200);
      res.body.data.forEach(item => {
        expect(item.type).toBe('image');
      });
    });

    test('应该支持按日期范围过滤', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-03-20');

      const res = await request(app)
        .get('/api/moments')
        .query({
          page: 1,
          limit: 10,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

      expect(res.status).toBe(200);
    });

    test('应该支持按关键字搜索', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10, keyword: 'test' });

      expect(res.status).toBe(200);
      res.body.data.forEach(item => {
        expect(item.nickname).toContain('test');
      });
    });
  });

  describe('虚拟滚动分页', () => {
    test('应该支持基于游标的分页', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ limit: 20, cursor: '507f1f77bcf86cd799439011' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(20);
    });

    test('应该返回下一页游标', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ limit: 20 });

      expect(res.body.pagination.nextCursor).toBeDefined();
      expect(typeof res.body.pagination.nextCursor).toBe('string');
    });

    test('应该支持无限滚动', async () => {
      const res1 = await request(app)
        .get('/api/users')
        .query({ limit: 20, cursor: 'cursor1' });

      const res2 = await request(app)
        .get('/api/users')
        .query({ limit: 20, cursor: res1.body.pagination.nextCursor });

      expect(res1.body.data).not.toEqual(res2.body.data);
    });
  });

  describe('分页性能', () => {
    test('应该在合理时间内返回结果', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 20 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(1000); // 1秒内返回
    });

    test('大数据量时应该有性能限制', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 100 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('单次查询不能超过100条');
    });
  });

  describe('分页缓存', () => {
    test('应该缓存分页结果', async () => {
      const query1 = { page: 1, limit: 10 };
      const query2 = { page: 1, limit: 10 };

      // 第一次请求
      const res1 = await request(app)
        .get('/api/users')
        .query(query1);

      // 第二次相同请求
      const res2 = await request(app)
        .get('/api/users')
        .query(query2);

      // 应该返回相同的结果(从缓存)
      expect(res1.body).toEqual(res2.body);
    });

    test('不同分页应该返回不同结果', async () => {
      const res1 = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10 });

      const res2 = await request(app)
        .get('/api/users')
        .query({ page: 2, limit: 10 });

      // 应该返回不同的结果
      expect(res1.body.data).not.toEqual(res2.body.data);
    });
  });

  describe('分页错误处理', () => {
    test('应该处理数据库错误', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 999999, limit: 10 });

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });

    test('应该处理无效的分页参数', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 'invalid', limit: 10 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('应该返回友好的错误信息', async () => {
      const res = await request(app)
        .get('/api/users')
        .query({ page: 0 });

      expect(res.body.error.message).toBeDefined();
      expect(typeof res.body.error.message).toBe('string');
      expect(res.body.error.message.length).toBeGreaterThan(0);
    });
  });
});

const request = require('supertest');
const { app } = require('../src/app');
const SensitiveWord = require('../src/models/SensitiveWord');

describe('Sensitive Words API Tests', () => {
  let adminToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        phone: '18800000000',
        password: 'Test123!@#'
      });
    adminToken = loginRes.body.data.token;
  });

  describe('POST /api/sensitive-words/add - 添加敏感词', () => {
    it('应该成功添加敏感词', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          word: '测试敏感词',
          category: 'general',
          level: 1
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('应该拒绝重复的敏感词', async () => {
      await request(app)
        .post('/api/sensitive-words/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ word: '重复词' });

      const res = await request(app)
        .post('/api/sensitive-words/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ word: '重复词' });

      expect(res.status).toBe(400);
    });

    it('应该验证必填字段', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/sensitive-words - 获取敏感词列表', () => {
    it('应该成功获取敏感词列表', async () => {
      const res = await request(app)
        .get('/api/sensitive-words')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const res = await request(app)
        .get('/api/sensitive-words?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('words');
      expect(res.body.data).toHaveProperty('total');
    });

    it('应该支持按分类筛选', async () => {
      const res = await request(app)
        .get('/api/sensitive-words?category=general')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/sensitive-words/:id - 更新敏感词', () => {
    let wordId;

    beforeAll(async () => {
      const word = await SensitiveWord.create({
        word: '待更新词',
        category: 'general',
        level: 1
      });
      wordId = word._id;
    });

    it('应该成功更新敏感词', async () => {
      const res = await request(app)
        .put(`/api/sensitive-words/${wordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          word: '已更新词',
          level: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/sensitive-words/:id - 删除敏感词', () => {
    let wordId;

    beforeAll(async () => {
      const word = await SensitiveWord.create({
        word: '待删除词',
        category: 'general',
        level: 1
      });
      wordId = word._id;
    });

    it('应该成功删除敏感词', async () => {
      const res = await request(app)
        .delete(`/api/sensitive-words/${wordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/sensitive-words/check - 检查内容', () => {
    it('应该检测到敏感词', async () => {
      await request(app)
        .post('/api/sensitive-words/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ word: '违禁词', category: 'illegal' });

      const res = await request(app)
        .post('/api/sensitive-words/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: '这是一个包含违禁词的内容' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('hasSensitiveWord');
      expect(res.body.data.hasSensitiveWord).toBe(true);
      expect(res.body.data).toHaveProperty('foundWords');
    });

    it('应该通过正常内容', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: '这是一条正常的内容' });

      expect(res.status).toBe(200);
      expect(res.body.data.hasSensitiveWord).toBe(false);
    });

    it('应该支持批量检查', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contents: [
            '正常内容1',
            '包含违禁词的内容',
            '正常内容2'
          ]
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.results)).toBe(true);
    });
  });

  describe('POST /api/sensitive-words/filter - 过滤敏感词', () => {
    it('应该成功过滤敏感词', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/filter')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: '这是一个包含违禁词的内容' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('filteredContent');
      expect(res.body.data).toHaveProperty('replacedCount');
    });

    it('应该支持自定义替换字符', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/filter')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: '这是一个包含违禁词的内容',
          replaceChar: '*'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.filteredContent).toContain('*');
    });
  });

  describe('POST /api/sensitive-words/bulk-import - 批量导入', () => {
    it('应该成功批量导入敏感词', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          words: [
            { word: '敏感词1', category: 'general', level: 1 },
            { word: '敏感词2', category: 'illegal', level: 2 },
            { word: '敏感词3', category: 'abusive', level: 1 }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('successCount');
      expect(res.body.data).toHaveProperty('failedCount');
    });

    it('应该拒绝无效的导入格式', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ words: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/sensitive-words/bulk-delete - 批量删除', () => {
    let wordIds = [];

    beforeAll(async () => {
      const word1 = await SensitiveWord.create({ word: '批量删除1' });
      const word2 = await SensitiveWord.create({ word: '批量删除2' });
      wordIds = [word1._id, word2._id];
    });

    it('应该成功批量删除敏感词', async () => {
      const res = await request(app)
        .post('/api/sensitive-words/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: wordIds });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/sensitive-words/stats - 获取统计信息', () => {
    it('应该成功获取统计信息', async () => {
      const res = await request(app)
        .get('/api/sensitive-words/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalCount');
      expect(res.body.data).toHaveProperty('categoryStats');
    });
  });
});

/**
 * 中间件测试
 * 测试所有中间件功能
 */

const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

describe('中间件测试', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
  });

  describe('CORS中间件', () => {
    test('应该设置正确的CORS头', async () => {
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      const res = await request(app).get('/test');

      expect(res.headers['access-control-allow-origin']).toBe('*');
    });

    test('应该允许预检请求', async () => {
      app.options('/test', (req, res) => {
        res.sendStatus(200);
      });

      const res = await request(app).options('/test');

      expect(res.status).toBe(204);
    });
  });

  describe('Helmet安全头中间件', () => {
    test('应该设置安全相关头', async () => {
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      const res = await request(app).get('/test');

      expect(res.headers['x-dns-prefetch-control']).toBeDefined();
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBeDefined();
    });

    test('应该设置XSS防护头', async () => {
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      const res = await request(app).get('/test');

      expect(res.headers['x-xss-protection']).toContain('1; mode=block');
    });
  });

  describe('频率限制中间件', () => {
    test('应该限制过多的请求', async () => {
      const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5
      });

      app.use(limiter);

      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      // 发送6个请求,超过限制
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(request(app).get('/test'));
      }

      const responses = await Promise.all(promises);

      // 最后一个请求应该被限流
      const lastResponse = responses[5];
      expect(lastResponse.status).toBe(429);
    });

    test('应该在一定时间后重置限制', async () => {
      const limiter = rateLimit({
        windowMs: 1000, // 1秒
        max: 2
      });

      app.use(limiter);

      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      // 发送2个请求
      await request(app).get('/test');
      await request(app).get('/test');

      // 等待窗口过期
      await new Promise(resolve => setTimeout(resolve, 1100));

      // 第3个请求应该成功
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
    });
  });

  describe('请求体解析中间件', () => {
    test('应该正确解析JSON请求体', async () => {
      app.post('/test', (req, res) => {
        res.json(req.body);
      });

      const res = await request(app)
        .post('/test')
        .send({ name: 'test', age: 25 });

      expect(res.body.name).toBe('test');
      expect(res.body.age).toBe(25);
    });

    test('应该正确解析表单数据', async () => {
      app.use(express.urlencoded({ extended: true }));

      app.post('/test', (req, res) => {
        res.json(req.body);
      });

      const res = await request(app)
        .post('/test')
        .send('name=test&age=25');

      expect(res.body.name).toBe('test');
      expect(res.body.age).toBe('25');
    });
  });

  describe('错误处理中间件', () => {
    test('应该捕获并处理错误', async () => {
      app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ error: err.message });
      });

      app.get('/error', (req, res, next) => {
        const error = new Error('Test error');
        next(error);
      });

      const res = await request(app).get('/error');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Test error');
    });

    test('应该处理404错误', async () => {
      app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
      });

      const res = await request(app).get('/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });
  });

  describe('认证中间件', () => {
    test('应该验证有效的JWT token', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId: '123' }, 'secret', { expiresIn: '1h' });

      const authMiddleware = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, 'secret');
          req.user = decoded;
          next();
        } catch (error) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      };

      app.get('/protected', authMiddleware, (req, res) => {
        res.json({ userId: req.user.userId });
      });

      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe('123');
    });

    test('应该拒绝无效的JWT token', async () => {
      const authMiddleware = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        try {
          jwt.verify(token, 'secret');
          next();
        } catch (error) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      };

      app.get('/protected', authMiddleware, (req, res) => {
        res.json({ message: 'success' });
      });

      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });
  });

  describe('日志记录中间件', () => {
    test('应该记录请求信息', async () => {
      const logs = [];

      const loggerMiddleware = (req, res, next) => {
        logs.push({
          method: req.method,
          url: req.url,
          headers: req.headers
        });
        next();
      };

      app.use(loggerMiddleware);

      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test');

      expect(logs.length).toBe(1);
      expect(logs[0].method).toBe('GET');
      expect(logs[0].url).toBe('/test');
    });

    test('应该记录响应信息', async () => {
      const logs = [];

      const loggerMiddleware = (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = function(data) {
          logs.push({
            statusCode: res.statusCode,
            data: data
          });
          originalJson(data);
        };
        next();
      };

      app.use(loggerMiddleware);

      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      await request(app).get('/test');

      expect(logs.length).toBe(1);
      expect(logs[0].statusCode).toBe(200);
      expect(logs[0].data.message).toBe('test');
    });
  });
});

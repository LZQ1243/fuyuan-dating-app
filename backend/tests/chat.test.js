const request = require('supertest');
const app = require('../src/app');

describe('Chat API Tests', () => {
  let userToken;
  let matchId;

  beforeAll(() => {
    userToken = 'user_test_token';
    matchId = '507f1f77bcf86cd799439011';
  });

  test('GET /api/chat/matches - 获取聊天匹配列表', async () => {
    const res = await request(app)
      .get('/api/chat/matches')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/chat/matches/:matchId - 获取聊天记录', async () => {
    const res = await request(app)
      .get(`/api/chat/matches/${matchId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .query({ page: 1, limit: 50 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.messages)).toBe(true);
  });

  test('POST /api/chat/send - 发送消息', async () => {
    const res = await request(app)
      .post('/api/chat/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        matchId: matchId,
        content: '这是一条测试消息',
        type: 'text'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('这是一条测试消息');
  });

  test('POST /api/chat/read - 标记消息为已读', async () => {
    const res = await request(app)
      .post('/api/chat/read')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        matchId: matchId,
        messageId: '507f1f77bcf86cd799439020'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

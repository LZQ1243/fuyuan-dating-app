const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('Upload API Tests', () => {
  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/fuyuan_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 清空测试集合
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  test('POST /upload/image - 上传图片', async () => {
    const res = await request(app)
      .post('/upload/image')
      .attach('image', Buffer.from('test image'), 'test.jpg');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
  });

  test('POST /upload/video - 上传视频', async () => {
    const res = await request(app)
      .post('/upload/video')
      .attach('video', Buffer.from('test video'), 'video.mp4');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
  });

  test('POST /upload/voice - 上传语音', async () => {
    const res = await request(app)
      .post('/upload/voice')
      .attach('voice', Buffer.from('test audio'), 'voice.mp3');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
  });

  test('文件大小限制测试', async () => {
    // 创建超过限制的文件 (11MB)
    const largeFile = Buffer.alloc(11 * 1024 * 1024);
    
    const res = await request(app)
      .post('/upload/image')
      .attach('image', largeFile, 'large.jpg');
    
    expect(res.statusCode).toBe(413); // Payload Too Large
  });
});

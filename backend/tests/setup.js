const mongoose = require('mongoose');

beforeAll(async () => {
  // 连接测试数据库
  const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/fuyuan_test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  // 关闭数据库连接
  await mongoose.connection.close();
});

beforeEach(async () => {
  // 清空所有集合
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

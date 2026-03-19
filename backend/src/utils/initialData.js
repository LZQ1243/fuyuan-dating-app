const ShortVideoPackage = require('../models/ShortVideoPackage');

async function initializePackages() {
  try {
    const existingPackages = await ShortVideoPackage.countDocuments();
    if (existingPackages > 0) {
      console.log('短视频套餐已存在，跳过初始化');
      return;
    }

    const packages = [
      {
        name: '体验套餐',
        description: '适合初次尝试的用户',
        video_limit: 3,
        validity_days: 7,
        price: 9.9
      },
      {
        name: '标准套餐',
        description: '适合经常上传的用户',
        video_limit: 10,
        validity_days: 30,
        price: 29.9
      },
      {
        name: '尊享套餐',
        description: '适合活跃用户的最佳选择',
        video_limit: 30,
        validity_days: 90,
        price: 79.9
      },
      {
        name: '无限套餐',
        description: '90天无限次上传',
        video_limit: 999,
        validity_days: 90,
        price: 199.9
      }
    ];

    await ShortVideoPackage.insertMany(packages);
    console.log('短视频套餐初始化完成');
  } catch (error) {
    console.error('初始化短视频套餐失败:', error);
  }
}

module.exports = { initializePackages };

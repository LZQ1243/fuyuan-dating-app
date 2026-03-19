const mysql = require('mysql2/promise');
const logger = require('../src/utils/logger');

async function initMySQLTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    logger.info('开始初始化MySQL数据库表...');

    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        real_name VARCHAR(50),
        id_card VARCHAR(18),
        ip_location TEXT,
        province VARCHAR(20),
        city VARCHAR(20),
        district VARCHAR(20),
        is_disabled TINYINT DEFAULT 0,
        disability_type TINYINT,
        disability_level TINYINT,
        disability_video VARCHAR(255),
        disability_photo VARCHAR(255),
        activity_video VARCHAR(255),
        marital_status TINYINT,
        registration_step TINYINT DEFAULT 1,
        status TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 创建婚姻认证表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS marriage_certifications (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT,
        certification_type TINYINT,
        certification_images TEXT,
        signature_image VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 创建短视频套餐表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS short_video_packages (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100),
        cover_image VARCHAR(255),
        price DECIMAL(10,2),
        duration INT,
        status TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 创建用户套餐表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_packages (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT,
        package_id BIGINT,
        expire_time DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES short_video_packages(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 创建短视频表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS short_videos (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT,
        title VARCHAR(200),
        video_url VARCHAR(255),
        cover_image VARCHAR(255),
        status TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.end();
    logger.info('MySQL数据库表初始化完成！');
    console.log('✅ MySQL数据库表初始化完成');
  } catch (error) {
    logger.error('MySQL数据库初始化失败:', error);
    console.error('❌ MySQL数据库初始化失败:', error.message);
    process.exit(1);
  }
}

initMySQLTables();

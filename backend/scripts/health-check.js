#!/usr/bin/env node

const http = require('http');
const mongoose = require('mongoose');

const healthCheck = async () => {
  const checks = {
    server: false,
    database: false,
    redis: false,
    rabbitmq: false
  };

  // 检查服务器
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    checks.server = data.status === 'ok';
    console.log(`✅ 服务器状态: ${checks.server ? '正常' : '异常'}`);
  } catch (error) {
    console.log(`❌ 服务器状态: ${error.message}`);
  }

  // 检查数据库
  try {
    if (mongoose.connection.readyState === 1) {
      checks.database = true;
      console.log('✅ 数据库连接: 正常');
    } else {
      console.log('❌ 数据库连接: 异常');
    }
  } catch (error) {
    console.log(`❌ 数据库连接: ${error.message}`);
  }

  // 检查Redis
  try {
    const redis = require('../src/utils/redis');
    await redis.ping();
    checks.redis = true;
    console.log('✅ Redis连接: 正常');
  } catch (error) {
    console.log(`❌ Redis连接: ${error.message}`);
  }

  // 检查RabbitMQ
  try {
    const amqp = require('amqplib');
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    await connection.close();
    checks.rabbitmq = true;
    console.log('✅ RabbitMQ连接: 正常');
  } catch (error) {
    console.log(`❌ RabbitMQ连接: ${error.message}`);
  }

  const allHealthy = Object.values(checks).every(check => check);
  console.log(`\n总体状态: ${allHealthy ? '✅ 健康' : '❌ 异常'}`);

  process.exit(allHealthy ? 0 : 1);
};

healthCheck();

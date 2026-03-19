#!/usr/bin/env node

/**
 * 接口对接测试脚本
 * 用于测试总管理后台与后端API的接口对接情况
 */

const axios = require('axios');

// 配置
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_PREFIX = '/api';

// 测试结果
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// 测试Token
let authToken = null;

/**
 * 测试单个接口
 */
async function testAPI(name, method, path, data = null, needAuth = false) {
  testResults.total++;

  try {
    const config = {
      method,
      url: `${BASE_URL}${API_PREFIX}${path}`,
      headers: {}
    };

    if (needAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data && ['GET', 'DELETE'].includes(method)) {
      config.params = data;
    } else if (data) {
      config.data = data;
    }

    const response = await axios(config);

    testResults.passed++;
    testResults.details.push({
      name,
      status: 'PASS',
      statusCode: response.status,
      message: 'OK'
    });

    console.log(`${colors.green}✓${colors.reset} ${name}`);

    return response.data;
  } catch (error) {
    testResults.failed++;
    const errorMessage = error.response
      ? `HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
      : error.message;

    testResults.details.push({
      name,
      status: 'FAIL',
      error: errorMessage
    });

    console.log(`${colors.red}✗${colors.reset} ${name} - ${colors.red}${errorMessage}${colors.reset}`);

    return null;
  }
}

/**
 * 打印测试结果
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('接口对接测试结果');
  console.log('='.repeat(80));
  console.log(`总计: ${testResults.total}`);
  console.log(`${colors.green}通过: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}失败: ${testResults.failed}${colors.reset}`);
  console.log(`完成度: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(80));

  if (testResults.failed > 0) {
    console.log('\n失败的接口:');
    testResults.details
      .filter(d => d.status === 'FAIL')
      .forEach(detail => {
        console.log(`  ${colors.red}✗${colors.reset} ${detail.name}: ${detail.error}`);
      });
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log(`${colors.blue}赴缘婚恋应用开发 - 接口对接测试${colors.reset}`);
  console.log(`测试地址: ${BASE_URL}\n`);

  // 1. 认证接口测试
  console.log(`${colors.yellow}1. 认证接口测试${colors.reset}`);
  console.log('-'.repeat(40));

  const loginResult = await testAPI(
    '用户登录',
    'POST',
    '/auth/login',
    { phone: 'admin', password: 'admin123' }
  );

  if (loginResult && loginResult.code === 200) {
    authToken = loginResult.data.token;
    console.log(`${colors.green}✓${colors.reset} Token获取成功\n`);
  }

  // 2. 管理员接口测试
  console.log(`${colors.yellow}2. 管理员接口测试${colors.reset}`);
  console.log('-'.repeat(40));

  await testAPI('获取统计数据', 'GET', '/admin/statistics', null, true);
  await testAPI('获取用户列表', 'GET', '/admin/users', { page: 1, limit: 10 }, true);
  await testAPI('获取敏感词列表', 'GET', '/admin/sensitive-words', null, true);
  await testAPI('获取待审核认证', 'GET', '/admin/certifications/pending', null, true);

  // 3. 配置中心接口测试
  console.log(`${colors.yellow}3. 配置中心接口测试${colors.reset}`);
  console.log('-'.repeat(40));

  await testAPI('获取配置摘要', 'GET', '/config/summary', null, true);
  await testAPI('健康检查', 'GET', '/config/health', null, true);
  await testAPI('获取所有配置', 'GET', '/config', null, true);
  await testAPI('获取API配置', 'GET', '/config/api', null, true);

  const testConfig = {
    api: {
      baseUrl: 'http://localhost:3000',
      port: 3000
    }
  };
  await testAPI('更新API配置', 'PUT', '/config/api', testConfig, true);

  await testAPI('重新加载API配置', 'POST', '/config/api/reload', null, true);
  await testAPI('获取配置元数据', 'GET', '/config/meta', null, true);
  await testAPI('获取配置历史', 'GET', '/config/history/api', null, true);
  await testAPI('获取快照列表', 'GET', '/config/snapshots', null, true);
  await testAPI('批量验证配置', 'POST', '/config/validate/batch', { configs: [testConfig] }, true);
  await testAPI('获取使用统计', 'GET', '/config/usage/stats', null, true);

  // 4. 其他接口测试
  console.log(`${colors.yellow}4. 其他接口测试${colors.reset}`);
  console.log('-'.repeat(40));

  await testAPI('获取用户信息', 'GET', '/auth/me', null, true);

  // 打印测试结果
  printResults();
}

// 运行测试
runTests().catch(error => {
  console.error(`${colors.red}测试执行失败:${colors.reset}`, error.message);
  process.exit(1);
});

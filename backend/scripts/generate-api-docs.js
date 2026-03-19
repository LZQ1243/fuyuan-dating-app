#!/usr/bin/env node

const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const swaggerSpec = require('../swagger');

// 生成OpenAPI JSON文档
const outputPath = path.join(__dirname, '../docs/api/openapi.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`✅ API文档已生成: ${outputPath}`);

// 生成Markdown文档
const markdownPath = path.join(__dirname, '../docs/api/README.md');

let markdown = `# 赴缘婚恋社交平台 API 文档

## 基本信息

- **版本**: 1.0.0
- **基础URL**: \`http://localhost:3000\` (开发环境) / \`https://api.fuyuan.com\` (生产环境)
- **认证方式**: Bearer Token (JWT)

## 目录

- [用户管理](#用户管理)
- [匹配系统](#匹配系统)
- [动态](#动态)
- [聊天](#聊天)
- [配置中心](#配置中心)

---

## 用户管理

### 注册用户
\`\`\`http
POST /api/users/register
\`\`\`

**请求体**:
\`\`\`json
{
  "phone": "13800138000",
  "password": "password123",
  "nickname": "用户昵称",
  "gender": "male"
}
\`\`\`

### 用户登录
\`\`\`http
POST /api/users/login
\`\`\`

**请求体**:
\`\`\`json
{
  "phone": "13800138000",
  "password": "password123"
}
\`\`\`

### 获取用户信息
\`\`\`http
GET /api/users/profile
\`\`\`

**请求头**:
\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## 匹配系统

### 获取匹配推荐
\`\`\`http
GET /api/match/recommendations?page=1&limit=10
\`\`\`

### 喜欢用户
\`\`\`http
POST /api/match/like
\`\`\`

**请求体**:
\`\`\`json
{
  "targetUserId": "user_id"
}
\`\`\`

---

## 动态

### 发布动态
\`\`\`http
POST /api/moments
\`\`\`

**请求体**:
\`\`\`json
{
  "content": "动态内容",
  "images": ["image1.jpg", "image2.jpg"],
  "visibility": "public"
}
\`\`\`

### 获取动态列表
\`\`\`http
GET /api/moments?page=1&limit=10
\`\`\`

---

## 聊天

### 获取聊天匹配列表
\`\`\`http
GET /api/chat/matches
\`\`\`

### 发送消息
\`\`\`http
POST /api/chat/send
\`\`\`

**请求体**:
\`\`\`json
{
  "matchId": "match_id",
  "content": "消息内容",
  "type": "text"
}
\`\`\`

---

## 配置中心

### 获取所有配置
\`\`\`http
GET /api/config/all
\`\`\`

### 更新配置
\`\`\`http
PUT /api/config/:key
\`\`\`

---

## 错误响应

所有错误响应遵循以下格式:

\`\`\`json
{
  "success": false,
  "message": "错误信息",
  "error": "错误详情"
}
\`\`\`

常见状态码:
- \`200\` - 成功
- \`201\` - 创建成功
- \`400\` - 请求参数错误
- \`401\` - 未授权
- \`403\` - 禁止访问
- \`404\` - 资源不存在
- \`500\` - 服务器错误

---

*文档生成时间: ${new Date().toISOString()}*
`;

fs.writeFileSync(markdownPath, markdown);
console.log(`✅ Markdown文档已生成: ${markdownPath}`);

// 生成Postman Collection
const postmanCollection = {
  info: {
    name: '赴缘婚恋社交平台 API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    description: '赴缘婚恋社交平台API Postman Collection'
  },
  item: [
    {
      name: '用户管理',
      item: [
        {
          name: '注册用户',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                phone: '13800138000',
                password: 'password123',
                nickname: '用户昵称',
                gender: 'male'
              }, null, 2)
            },
            url: {
              raw: '{{baseUrl}}/api/users/register',
              host: ['{{baseUrl}}'],
              path: ['api', 'users', 'register']
            }
          }
        },
        {
          name: '用户登录',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                phone: '13800138000',
                password: 'password123'
              }, null, 2)
            },
            url: {
              raw: '{{baseUrl}}/api/users/login',
              host: ['{{baseUrl}}'],
              path: ['api', 'users', 'login']
            }
          }
        }
      ]
    }
  ],
  variable: [
    {
      key: 'baseUrl',
      value: 'http://localhost:3000'
    }
  ]
};

const postmanPath = path.join(__dirname, '../docs/api/postman-collection.json');
fs.writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
console.log(`✅ Postman Collection已生成: ${postmanPath}`);

console.log('\n📚 所有API文档生成完成!');

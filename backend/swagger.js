const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '赴缘婚恋社交平台 API',
      version: '1.0.0',
      description: '赴缘婚恋社交平台后端API文档',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境',
      },
      {
        url: 'https://api.fuyuan.com',
        description: '生产环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            phone: { type: 'string' },
            nickname: { type: 'string' },
            gender: { type: 'string', enum: ['male', 'female'] },
            age: { type: 'number' },
            avatar: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user_id: { type: 'string' },
            target_user_id: { type: 'string' },
            match_score: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'matched', 'rejected'] },
          },
        },
        Moment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            content: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            author_id: { type: 'string' },
            likes_count: { type: 'number' },
            comments_count: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

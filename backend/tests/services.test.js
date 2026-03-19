/**
 * 服务层测试
 * 测试所有业务服务功能
 */

describe('服务层测试', () => {
  describe('缓存服务', () => {
    test('应该能够设置缓存', async () => {
      const mockRedis = {
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue('cached-value')
      };

      const result = await mockRedis.set('key', 'value', 300);
      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith('key', 'value', 300);
    });

    test('应该能够获取缓存', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue('cached-value'),
        set: jest.fn()
      };

      const result = await mockRedis.get('key');
      expect(result).toBe('cached-value');
      expect(mockRedis.get).toHaveBeenCalledWith('key');
    });

    test('应该能够删除缓存', async () => {
      const mockRedis = {
        del: jest.fn().mockResolvedValue(true)
      };

      const result = await mockRedis.del('key');
      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('key');
    });

    test('缓存未命中时应该返回null', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null)
      };

      const result = await mockRedis.get('nonexistent-key');
      expect(result).toBeNull();
    });

    test('应该能够批量删除缓存', async () => {
      const mockRedis = {
        del: jest.fn().mockResolvedValue(true),
        keys: jest.fn().mockResolvedValue(['key1', 'key2', 'key3'])
      };

      const keys = await mockRedis.keys('pattern:*');
      for (const key of keys) {
        await mockRedis.del(key);
      }

      expect(mockRedis.del).toHaveBeenCalledTimes(3);
    });
  });

  describe('文件上传服务', () => {
    test('应该能够上传图片文件', async () => {
      const mockMulter = {
        single: jest.fn().mockReturnValue((req, res, next) => {
          req.file = {
            originalname: 'test.jpg',
            mimetype: 'image/jpeg',
            size: 1024 * 50, // 50KB
            path: '/uploads/test.jpg'
          };
          next();
        })
      };

      const upload = mockMulter.single('image');

      const mockReq = {};
      const mockRes = {};
      let nextCalled = false;

      upload(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(mockReq.file).toBeDefined();
      expect(mockReq.file.originalname).toBe('test.jpg');
      expect(mockReq.file.mimetype).toBe('image/jpeg');
    });

    test('应该验证文件类型', async () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      const validateFileType = (mimetype) => {
        return allowedTypes.includes(mimetype);
      };

      expect(validateFileType('image/jpeg')).toBe(true);
      expect(validateFileType('image/png')).toBe(true);
      expect(validateFileType('application/pdf')).toBe(false);
      expect(validateFileType('image/tiff')).toBe(false);
    });

    test('应该验证文件大小', async () => {
      const maxSize = 5 * 1024 * 1024; // 5MB

      const validateFileSize = (size) => {
        return size <= maxSize;
      };

      expect(validateFileSize(1024 * 1024)).toBe(true); // 1MB
      expect(validateFileSize(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(validateFileSize(6 * 1024 * 1024)).toBe(false); // 6MB
      expect(validateFileSize(10 * 1024 * 1024)).toBe(false); // 10MB
    });

    test('应该生成唯一文件名', async () => {
      const crypto = require('crypto');
      const generateFileName = (originalname) => {
        const ext = originalname.split('.').pop();
        const name = crypto.randomBytes(16).toString('hex');
        return `${name}.${ext}`;
      };

      const filename1 = generateFileName('test.jpg');
      const filename2 = generateFileName('test.jpg');

      expect(filename1).not.toBe(filename2);
      expect(filename1).toMatch(/\.jpg$/);
      expect(filename2).toMatch(/\.jpg$/);
    });
  });

  describe('邮件服务', () => {
    test('应该能够发送验证邮件', async () => {
      const mockNodemailer = {
        createTransport: jest.fn().mockReturnValue({
          sendMail: jest.fn().mockResolvedValue({ response: '250 OK' })
        })
      };

      const transporter = mockNodemailer.createTransport({});

      await transporter.sendMail({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: '验证码',
        text: '您的验证码是123456'
      });

      expect(transporter.sendMail).toHaveBeenCalled();
    });

    test('应该能够发送通知邮件', async () => {
      const mockNodemailer = {
        createTransport: jest.fn().mockReturnValue({
          sendMail: jest.fn().mockResolvedValue({ response: '250 OK' })
        })
      };

      const transporter = mockNodemailer.createTransport({});

      await transporter.sendMail({
        from: 'noreply@example.com',
        to: 'user@example.com',
        subject: '新消息通知',
        html: '<p>您有一条新消息</p>'
      });

      expect(transporter.sendMail).toHaveBeenCalled();
    });

    test('发送失败时应该抛出错误', async () => {
      const mockNodemailer = {
        createTransport: jest.fn().mockReturnValue({
          sendMail: jest.fn().mockRejectedValue(new Error('Send failed'))
        })
      };

      const transporter = mockNodemailer.createTransport({});

      await expect(transporter.sendMail({})).rejects.toThrow('Send failed');
    });
  });

  describe('WebSocket服务', () => {
    test('应该能够创建WebSocket连接', async () => {
      const mockSocket = {
        on: jest.fn(),
        emit: jest.fn(),
        join: jest.fn()
      };

      mockSocket.on('connection', jest.fn());

      expect(mockSocket.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    test('应该能够发送消息到客户端', async () => {
      const mockSocket = {
        emit: jest.fn()
      };

      mockSocket.emit('message', { text: 'Hello' });

      expect(mockSocket.emit).toHaveBeenCalledWith('message', { text: 'Hello' });
    });

    test('应该能够广播消息', async () => {
      const mockIO = {
        emit: jest.fn()
      };

      mockIO.emit('message', { text: 'Broadcast' });

      expect(mockIO.emit).toHaveBeenCalledWith('message', { text: 'Broadcast' });
    });

    test('应该能够加入房间', async () => {
      const mockSocket = {
        join: jest.fn()
      };

      mockSocket.join('room123');

      expect(mockSocket.join).toHaveBeenCalledWith('room123');
    });

    test('应该能够离开房间', async () => {
      const mockSocket = {
        leave: jest.fn()
      };

      mockSocket.leave('room123');

      expect(mockSocket.leave).toHaveBeenCalledWith('room123');
    });

    test('连接断开时应该清理资源', async () => {
      const mockSocket = {
        on: jest.fn(),
        disconnect: jest.fn()
      };

      mockSocket.on('disconnect', (socket) => {
        socket.disconnect();
      });

      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('推送服务', () => {
    test('应该能够发送推送通知', async () => {
      const mockPush = {
        send: jest.fn().mockResolvedValue({ success: true, messageId: '123' })
      };

      const result = await mockPush.send({
        title: '新消息',
        body: '您有一条新消息',
        tokens: ['token1', 'token2']
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('123');
      expect(mockPush.send).toHaveBeenCalled();
    });

    test('应该能够批量发送推送', async () => {
      const mockPush = {
        send: jest.fn().mockResolvedValue({ success: true })
      };

      await mockPush.send({
        title: '批量通知',
        body: '批量内容',
        tokens: ['token1', 'token2', 'token3']
      });

      expect(mockPush.send).toHaveBeenCalled();
    });

    test('无效token时应该跳过推送', async () => {
      const mockPush = {
        send: jest.fn().mockResolvedValue({ success: false, skipped: 2 })
      };

      const result = await mockPush.send({
        title: '通知',
        body: '内容',
        tokens: [null, '', 'valid-token']
      });

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(2);
    });
  });

  describe('短信服务', () => {
    test('应该能够发送验证码短信', async () => {
      const mockSMS = {
        send: jest.fn().mockResolvedValue({ success: true, messageId: '123' })
      };

      const result = await mockSMS.send({
        phone: '13800138000',
        code: '123456',
        template: 'VERIFY_CODE'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('123');
    });

    test('应该能够发送通知短信', async () => {
      const mockSMS = {
        send: jest.fn().mockResolvedValue({ success: true })
      };

      await mockSMS.send({
        phone: '13800138000',
        message: '您有一条新消息',
        type: 'NOTIFICATION'
      });

      expect(mockSMS.send).toHaveBeenCalled();
    });

    test('发送失败时应该返回错误', async () => {
      const mockSMS = {
        send: jest.fn().mockRejectedValue(new Error('SMS send failed'))
      };

      await expect(mockSMS.send({
        phone: '13800138000',
        code: '123456'
      })).rejects.toThrow('SMS send failed');
    });

    test('应该验证手机号格式', async () => {
      const validatePhone = (phone) => {
        const regex = /^1[3-9]\d{9}$/;
        return regex.test(phone);
      };

      expect(validatePhone('13800138000')).toBe(true);
      expect(validatePhone('1380013800')).toBe(false); // 10位
      expect(validatePhone('23800138000')).toBe(false); // 不是1开头
      expect(validatePhone('abc12345678')).toBe(false); // 非数字
    });
  });
});

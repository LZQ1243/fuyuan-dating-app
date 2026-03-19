/**
 * 验证器测试
 * 测试所有输入验证功能
 */

const { body, validationResult } = require('express-validator');

describe('验证器测试', () => {
  describe('手机号验证', () => {
    test('应该验证正确的手机号', () => {
      const errors = validationResult({
        phone: {
          value: '13800138000',
          msg: '手机号格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝无效的手机号-不足11位', () => {
      const errors = validationResult({
        phone: {
          value: '1380013800',
          msg: '手机号长度不正确',
          type: 'length'
        }
      });

      expect(errors.array()).toHaveLength(1);
      expect(errors.array()[0].msg).toBe('手机号长度不正确');
    });

    test('应该拒绝无效的手机号-不是1开头', () => {
      const errors = validationResult({
        phone: {
          value: '23800138000',
          msg: '手机号必须以1开头',
          type: 'prefix'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝非数字手机号', () => {
      const errors = validationResult({
        phone: {
          value: 'abcdefghijk',
          msg: '手机号必须为数字',
          type: 'numeric'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('密码验证', () => {
    test('应该验证强密码', () => {
      const errors = validationResult({
        password: {
          value: 'P@ssw0rd123!',
          msg: '密码强度符合要求'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝弱密码', () => {
      const errors = validationResult({
        password: {
          value: '123456',
          msg: '密码强度不足',
          type: 'strength'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝少于8位的密码', () => {
      const errors = validationResult({
        password: {
          value: '1234567',
          msg: '密码长度不能少于8位',
          type: 'length'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝超过20位的密码', () => {
      const errors = validationResult({
        password: {
          value: 'a'.repeat(21),
          msg: '密码长度不能超过20位',
          type: 'length'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('邮箱验证', () => {
    test('应该验证正确的邮箱', () => {
      const errors = validationResult({
        email: {
          value: 'test@example.com',
          msg: '邮箱格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝无效的邮箱格式', () => {
      const errors = validationResult({
        email: {
          value: 'invalid-email',
          msg: '邮箱格式不正确',
          type: 'format'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝已注册的邮箱', async () => {
      const mockUser = {
        findOne: jest.fn().mockResolvedValue({ email: 'test@example.com' })
      };

      const errors = validationResult({
        email: {
          value: 'test@example.com',
          msg: '该邮箱已被注册',
          type: 'duplicate'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('昵称验证', () => {
    test('应该验证合法的昵称', () => {
      const errors = validationResult({
        nickname: {
          value: '用户昵称',
          msg: '昵称格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝空昵称', () => {
      const errors = validationResult({
        nickname: {
          value: '',
          msg: '昵称不能为空',
          type: 'empty'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝超过20字的昵称', () => {
      const errors = validationResult({
        nickname: {
          value: 'a'.repeat(21),
          msg: '昵称不能超过20个字',
          type: 'length'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝包含敏感词的昵称', () => {
      const errors = validationResult({
        nickname: {
          value: '敏感词测试',
          msg: '昵称包含敏感词',
          type: 'sensitive'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('年龄验证', () => {
    test('应该验证合法的年龄', () => {
      const errors = validationResult({
        age: {
          value: '25',
          msg: '年龄格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝小于18的年龄', () => {
      const errors = validationResult({
        age: {
          value: '17',
          msg: '年龄必须满18岁',
          type: 'min'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝大于60的年龄', () => {
      const errors = validationResult({
        age: {
          value: '61',
          msg: '年龄不能超过60岁',
          type: 'max'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝非数字年龄', () => {
      const errors = validationResult({
        age: {
          value: 'abc',
          msg: '年龄必须为数字',
          type: 'numeric'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('身份证验证', () => {
    test('应该验证正确的身份证', () => {
      const errors = validationResult({
        idCard: {
          value: '110101199003078888',
          msg: '身份证格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝无效的身份证', () => {
      const errors = validationResult({
        idCard: {
          value: '1234567890123456789',
          msg: '身份证格式不正确',
          type: 'format'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该验证身份证校验位', () => {
      const errors = validationResult({
        idCard: {
          value: '11010119900307888X',
          msg: '身份证校验位不正确',
          type: 'checksum'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('内容验证', () => {
    test('应该验证合法的内容', () => {
      const errors = validationResult({
        content: {
          value: '这是一条正常的动态内容',
          msg: '内容格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝空内容', () => {
      const errors = validationResult({
        content: {
          value: '',
          msg: '内容不能为空',
          type: 'empty'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝超过500字的内容', () => {
      const errors = validationResult({
        content: {
          value: 'a'.repeat(501),
          msg: '内容不能超过500个字',
          type: 'length'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝包含敏感词的内容', () => {
      const errors = validationResult({
        content: {
          value: '这是测试敏感词的内容',
          msg: '内容包含敏感词',
          type: 'sensitive'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('图片验证', () => {
    test('应该验证合法的图片', () => {
      const errors = validationResult({
        image: {
          value: {
            originalname: 'test.jpg',
            mimetype: 'image/jpeg',
            size: 1024 * 50
          },
          msg: '图片格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝非图片文件', () => {
      const errors = validationResult({
        image: {
          value: {
            originalname: 'test.pdf',
            mimetype: 'application/pdf'
          },
          msg: '只支持jpg、png、gif格式的图片',
          type: 'format'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝过大的图片', () => {
      const errors = validationResult({
        image: {
          value: {
            originalname: 'test.jpg',
            size: 10 * 1024 * 1024 // 10MB
          },
          msg: '图片大小不能超过5MB',
          type: 'size'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });

  describe('视频验证', () => {
    test('应该验证合法的视频', () => {
      const errors = validationResult({
        video: {
          value: {
            originalname: 'test.mp4',
            mimetype: 'video/mp4',
            size: 50 * 1024 * 1024
          },
          msg: '视频格式正确'
        }
      });

      expect(errors.array()).toHaveLength(0);
    });

    test('应该拒绝非视频文件', () => {
      const errors = validationResult({
        video: {
          value: {
            originalname: 'test.jpg',
            mimetype: 'image/jpeg'
          },
          msg: '只支持mp4格式的视频',
          type: 'format'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });

    test('应该拒绝过长的视频', () => {
      const errors = validationResult({
        video: {
          value: {
            originalname: 'test.mp4',
            size: 600 * 1024 * 1024 // 600MB
          },
          msg: '视频大小不能超过500MB',
          type: 'size'
        }
      });

      expect(errors.array()).toHaveLength(1);
    });
  });
});

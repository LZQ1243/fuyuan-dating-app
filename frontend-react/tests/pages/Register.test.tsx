import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Register from '../../pages/Register';

// Mock API
vi.mock('../../api/auth', () => ({
  sendSMS: vi.fn(),
  register: vi.fn(),
  verifyCode: vi.fn()
}));

// Mock Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...require('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Register页面测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('页面渲染', () => {
    it('应该正确渲染注册页面', () => {
      render(<Register />);

      expect(screen.getByText('注册')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('手机号')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('验证码')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('确认密码')).toBeInTheDocument();
    });

    it('应该显示协议复选框', () => {
      render(<Register />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('我已阅读并同意')).toBeInTheDocument();
    });

    it('应该显示注册按钮', () => {
      render(<Register />);

      const button = screen.getByRole('button', { name: '注册' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('表单验证', () => {
    it('手机号格式不正确时应该显示错误', async () => {
      render(<Register />);

      const phoneInput = screen.getByPlaceholderText('手机号');
      fireEvent.change(phoneInput, '123');
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(screen.getByText('请输入正确的手机号')).toBeInTheDocument();
      });
    });

    it('验证码为空时应该显示错误', async () => {
      render(<Register />);

      const codeInput = screen.getByPlaceholderText('验证码');
      fireEvent.change(codeInput, '');
      fireEvent.blur(codeInput);

      await waitFor(() => {
        expect(screen.getByText('验证码不能为空')).toBeInTheDocument();
      });
    });

    it('密码少于6位时应该显示错误', async () => {
      render(<Register />);

      const passwordInput = screen.getByPlaceholderText('密码');
      fireEvent.change(passwordInput, '12345');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText('密码至少6位')).toBeInTheDocument();
      });
    });

    it('确认密码与密码不一致时应该显示错误', async () => {
      render(<Register />);

      const passwordInput = screen.getByPlaceholderText('密码');
      const confirmInput = screen.getByPlaceholderText('确认密码');

      fireEvent.change(passwordInput, 'password123');
      fireEvent.change(confirmInput, 'password456');
      fireEvent.blur(confirmInput);

      await waitFor(() => {
        expect(screen.getByText('两次密码不一致')).toBeInTheDocument();
      });
    });

    it('未勾选协议时注册按钮应该禁用', () => {
      render(<Register />);

      const checkbox = screen.getByRole('checkbox');
      const button = screen.getByRole('button', { name: '注册' });

      expect(button).toBeDisabled();

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('验证码功能', () => {
    it('点击发送验证码应该调用API', async () => {
      const { sendSMS } = require('../../api/auth');

      render(<Register />);

      const phoneInput = screen.getByPlaceholderText('手机号');
      const sendCodeButton = screen.getByText('发送验证码');

      fireEvent.change(phoneInput, '13800138000');
      fireEvent.click(sendCodeButton);

      await waitFor(() => {
        expect(sendSMS).toHaveBeenCalledWith('13800138000');
      });
    });

    it('发送验证码后应该开始倒计时', async () => {
      render(<Register />);

      const phoneInput = screen.getByPlaceholderText('手机号');
      const sendCodeButton = screen.getByText('发送验证码');

      fireEvent.change(phoneInput, '13800138000');
      fireEvent.click(sendCodeButton);

      await waitFor(() => {
        expect(screen.getByText(/60s/)).toBeInTheDocument();
      });
    });

    it('倒计时结束后应该可以重新发送', async () => {
      render(<Register />);

      const phoneInput = screen.getByPlaceholderText('手机号');
      const sendCodeButton = screen.getByText('发送验证码');

      fireEvent.change(phoneInput, '13800138000');
      fireEvent.click(sendCodeButton);

      // 等待倒计时结束
      await new Promise(resolve => setTimeout(resolve, 61000));

      await waitFor(() => {
        expect(sendCodeButton).not.toBeDisabled();
      });
    });
  });

  describe('注册功能', () => {
    it('表单验证通过时应该成功注册', async () => {
      const { register } = require('../../api/auth');
      register.mockResolvedValue({ success: true, token: 'mock-token' });

      render(<Register />);

      const phoneInput = screen.getByPlaceholderText('手机号');
      const codeInput = screen.getByPlaceholderText('验证码');
      const passwordInput = screen.getByPlaceholderText('密码');
      const confirmInput = screen.getByPlaceholderText('确认密码');
      const checkbox = screen.getByRole('checkbox');
      const button = screen.getByRole('button', { name: '注册' });

      fireEvent.change(phoneInput, '13800138000');
      fireEvent.change(codeInput, '123456');
      fireEvent.change(passwordInput, 'password123');
      fireEvent.change(confirmInput, 'password123');
      fireEvent.click(checkbox);
      fireEvent.click(button);

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith({
          phone: '13800138000',
          code: '123456',
          password: 'password123'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('注册失败时应该显示错误信息', async () => {
      const { register } = require('../../api/auth');
      register.mockResolvedValue({ success: false, message: '手机号已注册' });

      render(<Register />);

      const phoneInput = screen.getByPlaceholderText('手机号');
      const codeInput = screen.getByPlaceholderText('验证码');
      const passwordInput = screen.getByPlaceholderText('密码');
      const confirmInput = screen.getByPlaceholderText('确认密码');
      const checkbox = screen.getByRole('checkbox');
      const button = screen.getByRole('button', { name: '注册' });

      fireEvent.change(phoneInput, '13800138000');
      fireEvent.change(codeInput, '123456');
      fireEvent.change(passwordInput, 'password123');
      fireEvent.change(confirmInput, 'password123');
      fireEvent.click(checkbox);
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('手机号已注册')).toBeInTheDocument();
      });
    });

    it('注册过程中应该显示加载状态', async () => {
      const { register } = require('../../api/auth');
      let resolvePromise;
      register.mockImplementation(() => {
        return new Promise(resolve => {
          resolvePromise = resolve;
        });
      });

      render(<Register />);

      const button = screen.getByRole('button', { name: '注册' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/加载中.../)).toBeInTheDocument();
        expect(button).toBeDisabled();
      });

      resolvePromise({ success: true });
    });
  });

  describe('密码强度', () => {
    it('应该显示密码强度指示器', async () => {
      render(<Register />);

      const passwordInput = screen.getByPlaceholderText('密码');
      fireEvent.change(passwordInput, 'password123');

      await waitFor(() => {
        expect(screen.getByText('弱')).toBeInTheDocument();
      });
    });

    it('密码长度增加时强度应该提升', async () => {
      render(<Register />);

      const passwordInput = screen.getByPlaceholderText('密码');
      fireEvent.change(passwordInput, 'password123456');

      await waitFor(() => {
        expect(screen.getByText('中')).toBeInTheDocument();
      });
    });

    it('复杂密码应该显示强', async () => {
      render(<Register />);

      const passwordInput = screen.getByPlaceholderText('密码');
      fireEvent.change(passwordInput, 'P@ssw0rd123!');

      await waitFor(() => {
        expect(screen.getByText('强')).toBeInTheDocument();
      });
    });
  });

  describe('链接跳转', () => {
    it('点击已有账号应该跳转到登录页', () => {
      render(<Register />);

      const loginLink = screen.getByText('已有账号');
      fireEvent.click(loginLink);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('点击用户协议应该打开协议页面', () => {
      render(<Register />);

      const agreementLink = screen.getByText('用户协议');
      fireEvent.click(agreementLink);

      expect(mockNavigate).toHaveBeenCalledWith('/agreement');
    });
  });
});

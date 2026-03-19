import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/pages/Login';

vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({
      data: {
        success: true,
        data: { token: 'test_token', user: { phone: '13800138000' } }
      }
    }))
  }
}));

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Login Page', () => {
  it('应该正确渲染登录页', () => {
    renderWithRouter(<Login />);
    expect(screen.getByRole('form') || screen.getByText('登录')).toBeInTheDocument();
  });

  it('应该包含手机号输入框', () => {
    renderWithRouter(<Login />);
    const phoneInput = screen.getByPlaceholderText(/手机号|请输入手机号/i);
    expect(phoneInput).toBeInTheDocument();
  });

  it('应该包含密码输入框', () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByPlaceholderText(/密码|请输入密码/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it('应该包含登录按钮', () => {
    renderWithRouter(<Login />);
    const loginButton = screen.getByRole('button', { name: /登录|立即登录/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('应该在输入手机号后更新状态', async () => {
    renderWithRouter(<Login />);
    const phoneInput = screen.getByPlaceholderText(/手机号|请输入手机号/i);

    fireEvent.change(phoneInput, { target: { value: '13800138000' } });

    await waitFor(() => {
      expect(phoneInput).toHaveValue('13800138000');
    });
  });
});

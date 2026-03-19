import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from '../../components/Input';

// Mock表单验证
vi.mock('../../api/validation', () => ({
  validateField: vi.fn()
}));

describe('Input组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染文本输入框', () => {
      render(<Input label="用户名" placeholder="请输入用户名" />);

      expect(screen.getByLabelText('用户名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    });

    it('应该渲染密码输入框', () => {
      render(<Input label="密码" type="password" />);

      const input = screen.getByLabelText('密码');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('应该渲染数字输入框', () => {
      render(<Input label="年龄" type="number" />);

      const input = screen.getByLabelText('年龄');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('应该渲染多行文本框', () => {
      render(<Input label="个人简介" type="textarea" />);

      const textarea = screen.getByLabelText('个人简介');
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('输入验证', () => {
    it('应该验证必填字段', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: false, error: '字段不能为空' });

      render(<Input label="必填" required />);

      const input = screen.getByLabelText('必填');
      fireEvent.change(input, '');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('字段不能为空')).toBeInTheDocument();
      });
    });

    it('应该验证最小长度', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: false, error: '长度不能少于3位' });

      render(<Input label="最小长度" minLength={3} />);

      const input = screen.getByLabelText('最小长度');
      fireEvent.change(input, 'ab');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('长度不能少于3位')).toBeInTheDocument();
      });
    });

    it('应该验证最大长度', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: false, error: '长度不能超过20位' });

      render(<Input label="最大长度" maxLength={20} />);

      const input = screen.getByLabelText('最大长度');
      const longText = 'a'.repeat(21);
      fireEvent.change(input, longText.slice(0, 20));
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('长度不能超过20位')).toBeInTheDocument();
      });
    });

    it('应该验证格式', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: false, error: '格式不正确' });

      render(<Input label="手机号" pattern="/^1[3-9]\d{9}$" />);

      const input = screen.getByLabelText('手机号');
      fireEvent.change(input, '123456789012');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('格式不正确')).toBeInTheDocument();
      });
    });
  });

  describe('焦点管理', () => {
    it('应该能够聚焦', () => {
      const { result } = render(<Input label="聚焦" />);

      result.current.focus();

      const input = screen.getByLabelText('聚焦');
      expect(input).toEqual(document.activeElement);
    });

    it('应该能够失焦', () => {
      const { result } = render(<Input label="失焦" />);

      result.current.focus();
      result.current.blur();

      const input = screen.getByLabelText('失焦');
      expect(input).not.toEqual(document.activeElement);
    });

    it('焦点时应该显示高亮边框', () => {
      const { result } = render(<Input label="焦点" />);

      result.current.focus();

      const input = screen.getByLabelText('焦点');
      expect(input).toHaveClass('focused');
    });
  });

  describe('禁用状态', () => {
    it('禁用的输入框不应该接受输入', () => {
      render(<Input label="禁用" disabled />);

      const input = screen.getByLabelText('禁用');
      expect(input).toBeDisabled();
    });

    it('应该显示禁用样式', () => {
      render(<Input label="禁用" disabled />);

      const input = screen.getByLabelText('禁用');
      expect(input).toHaveClass('disabled');
    });
  });

  describe('图标输入', () => {
    it('应该显示前缀图标', () => {
      render(<Input label="手机号" prefix="📱" />);

      const input = screen.getByLabelText('手机号');
      expect(screen.getByText('📱')).toBeInTheDocument();
    });

    it('应该显示后缀图标', () => {
      render(<Input label="邮箱" suffix="@" />);

      const input = screen.getByLabelText('邮箱');
      expect(screen.getByText('@')).toBeInTheDocument();
    });

    it('应该显示清除图标', () => {
      render(<Input label="搜索" allowClear />);

      fireEvent.change(screen.getByLabelText('搜索'), 'test');
      expect(screen.getByTitle('清除')).toBeInTheDocument();
    });

    it('点击清除图标应该清空输入', () => {
      render(<Input label="搜索" allowClear />);

      const input = screen.getByLabelText('搜索');
      fireEvent.change(input, 'test');
      fireEvent.click(screen.getByTitle('清除'));

      expect(input.value).toBe('');
    });
  });

  describe('自动完成', () => {
    it('应该支持自动完成功能', () => {
      render(<Input label="自动完成" autoComplete="on" />);

      const input = screen.getByLabelText('自动完成');
      expect(input).toHaveAttribute('autocomplete', 'on');
    });

    it('应该禁用自动完成', () => {
      render(<Input label="禁用自动完成" autoComplete="off" />);

      const input = screen.getByLabelText('禁用自动完成');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('应该支持数据列表', () => {
      const dataList = ['选项1', '选项2', '选项3'];
      render(
        <Input
          label="自动完成"
          list="options"
          datalist={dataList}
        />
      );

      const datalist = screen.getByTestId('options');
      expect(datalist).toBeInTheDocument();
    });
  });

  describe('多值输入', () => {
    it('应该支持多值输入', () => {
      render(<Input label="标签" multiple />);

      const input = screen.getByLabelText('标签');
      expect(input).toHaveAttribute('multiple');
    });

    it('应该分隔多个值', () => {
      render(<Input label="标签" multiple separator="," />);

      const input = screen.getByLabelText('标签');
      fireEvent.change(input, 'tag1,tag2,tag3');

      expect(input.value).toBe('tag1,tag2,tag3');
    });
  });

  describe('字数统计', () => {
    it('应该显示剩余字符数', () => {
      render(<Input label="简介" maxLength={100} showCount />);

      const input = screen.getByLabelText('简介');
      fireEvent.change(input, '测试简介');

      expect(screen.getByText(/剩余.*字/)).toBeInTheDocument();
    });

    it('应该更新字数统计', () => {
      render(<Input label="简介" maxLength={100} showCount />);

      const input = screen.getByLabelText('简介');

      fireEvent.change(input, '测试');
      expect(screen.getByText(/剩余.*97字/)).toBeInTheDocument();

      fireEvent.change(input, '测试更长的简介内容');
      expect(screen.getByText(/剩余.*\d+字/)).toBeInTheDocument();
    });
  });

  describe('实时验证', () => {
    it('输入时应该实时验证', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: true });

      render(<Input label="实时验证" validate="realtime" />);

      const input = screen.getByLabelText('实时验证');
      fireEvent.change(input, 'test');

      await waitFor(() => {
        expect(validateField).toHaveBeenCalled();
      });
    });

    it('应该显示验证状态', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: false, error: '格式错误' });

      render(<Input label="验证状态" validate="realtime" />);

      const input = screen.getByLabelText('验证状态');
      fireEvent.change(input, 'invalid');

      await waitFor(() => {
        expect(screen.getByText('格式错误')).toBeInTheDocument();
      });
    });
  });

  describe('无障碍', () => {
    it('输入框应该有正确的ARIA标签', () => {
      render(<Input label="无障碍" aria-label="用户名输入" />);

      const input = screen.getByLabelText('无障碍');
      expect(input).toHaveAttribute('aria-label', '用户名输入');
    });

    it('应该支持键盘导航', () => {
      render(<Input label="键盘导航" />);

      const input = screen.getByLabelText('键盘导航');

      // Tab键应该切换焦点
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });

      // Enter键应该触发提交
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Escape键应该清空
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    });

    it('应该支持屏幕阅读器', () => {
      render(<Input label="屏幕阅读器" aria-describedby="help-text" />);

      const input = screen.getByLabelText('屏幕阅读器');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('自定义样式', () => {
    it('应该应用自定义样式', () => {
      render(
        <Input label="自定义" style={{ backgroundColor: 'lightblue' }} />
      );

      const input = screen.getByLabelText('自定义');
      expect(input).toHaveStyle({ backgroundColor: 'lightblue' });
    });

    it('应该应用自定义className', () => {
      render(
        <Input label="自定义" className="custom-input" />
      );

      const input = screen.getByLabelText('自定义');
      expect(input).toHaveClass('custom-input');
    });

    it('应该支持尺寸自定义', () => {
      render(<Input label="大小" size="large" />);

      const input = screen.getByLabelText('大小');
      expect(input).toHaveClass('input-large');
    });
  });

  describe('错误状态', () => {
    it('验证失败应该显示错误样式', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: false, error: '错误信息' });

      render(<Input label="错误" required />);

      const input = screen.getByLabelText('错误');
      fireEvent.change(input, '');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveClass('error');
        expect(screen.getByText('错误信息')).toBeInTheDocument();
      });
    });

    it('验证成功应该显示成功样式', async () => {
      const { validateField } = require('../../api/validation');
      validateField.mockResolvedValue({ valid: true });

      render(<Input label="成功" validate="realtime" />);

      const input = screen.getByLabelText('成功');
      fireEvent.change(input, 'valid value');

      await waitFor(() => {
        expect(input).toHaveClass('success');
      });
    });
  });
});

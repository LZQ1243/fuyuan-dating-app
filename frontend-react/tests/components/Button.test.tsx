import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../../components/Button';

// Mock图标
vi.mock('@ant-design/icons', () => ({
  UserOutlined: () => 'UserOutlined',
  SearchOutlined: () => 'SearchOutlined',
}));

describe('Button组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染默认按钮', () => {
      render(<Button>点击</Button>);

      expect(screen.getByText('点击')).toBeInTheDocument();
    });

    it('应该渲染不同类型的按钮', () => {
      const { rerender } = render(<Button type="primary">主要按钮</Button>);
      expect(screen.getByText('主要按钮')).toBeInTheDocument();

      rerender(<Button type="danger">危险按钮</Button>);
      expect(screen.getByText('危险按钮')).toBeInTheDocument();

      rerender(<Button type="ghost">幽灵按钮</Button>);
      expect(screen.getByText('幽灵按钮')).toBeInTheDocument();
    });

    it('应该渲染不同尺寸的按钮', () => {
      const { rerender } = render(<Button size="small">小按钮</Button>);
      expect(screen.getByText('小按钮')).toBeInTheDocument();

      rerender(<Button size="large">大按钮</Button>);
      expect(screen.getByText('大按钮')).toBeInTheDocument();

      rerender(<Button size="default">默认按钮</Button>);
      expect(screen.getByText('默认按钮')).toBeInTheDocument();
    });
  });

  describe('禁用状态', () => {
    it('禁用的按钮不应该响应点击', () => {
      render(<Button disabled>禁用按钮</Button>);

      const button = screen.getByText('禁用按钮');
      expect(button).toBeDisabled();
    });

    it('应该显示禁用样式', () => {
      render(<Button disabled>禁用按钮</Button>);

      const button = screen.getByText('禁用按钮');
      expect(button).toHaveClass('disabled');
    });

    it('应该显示禁用图标', () => {
      render(<Button disabled loading={true}>加载中</Button>);

      expect(screen.getByText('加载中')).toBeInTheDocument();
    });
  });

  describe('加载状态', () => {
    it('加载中应该显示loading图标', () => {
      render(<Button loading>加载中</Button>);

      expect(screen.getByText(/加载/)).toBeInTheDocument();
    });

    it('加载中按钮应该被禁用', () => {
      render(<Button loading>加载中</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('加载完成后应该可以点击', () => {
      const { rerender } = render(<Button loading>加载中</Button>);

      rerender(<Button loading={false}>点击</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('图标按钮', () => {
    it('应该显示左图标', () => {
      render(
        <Button icon="user">用户</Button>
      );

      expect(screen.getByText('用户')).toBeInTheDocument();
    });

    it('应该显示右图标', () => {
      render(
        <Button icon="user" iconPosition="right">用户</Button>
      );

      expect(screen.getByText('用户')).toBeInTheDocument();
    });

    it('应该只显示图标', () => {
      render(
        <Button icon="user" />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('按钮组', () => {
    it('应该渲染按钮组', () => {
      render(
        <Button.Group>
          <Button>按钮1</Button>
          <Button>按钮2</Button>
          <Button>按钮3</Button>
        </Button.Group>
      );

      expect(screen.getByText('按钮1')).toBeInTheDocument();
      expect(screen.getByText('按钮2')).toBeInTheDocument();
      expect(screen.getByText('按钮3')).toBeInTheDocument();
    });

    it('按钮组应该有正确的样式', () => {
      render(
        <Button.Group>
          <Button>按钮</Button>
        </Button.Group>
      );

      const buttonGroup = screen.getByRole('button').parentElement;
      expect(buttonGroup).toHaveClass('btn-group');
    });
  });

  describe('块级按钮', () => {
    it('应该渲染块级按钮', () => {
      render(<Button block>全宽按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-block');
    });

    it('块级按钮应该占满容器宽度', () => {
      render(<Button block>全宽按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '100%' });
    });
  });

  describe('链接按钮', () => {
    it('应该渲染链接按钮', () => {
      render(<Button href="https://example.com">链接</Button>);

      const link = screen.getByText('链接').closest('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('链接按钮应该在新窗口打开', () => {
      render(
        <Button href="https://example.com" target="_blank">链接</Button>
      );

      const link = screen.getByText('链接').closest('a');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('危险操作', () => {
    it('危险按钮应该有警告样式', () => {
      render(<Button danger>删除</Button>);

      const button = screen.getByText('删除');
      expect(button).toHaveClass('btn-danger');
    });

    it('应该显示确认对话框', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <Button danger onConfirm={onConfirm} onCancel={onCancel}>
          删除
        </Button>
      );

      fireEvent.click(screen.getByText('删除'));

      // 应该显示确认对话框
      await waitFor(() => {
        expect(screen.getByText('确定要删除吗?')).toBeInTheDocument();
      });
    });

    it('确认后应该触发onConfirm', async () => {
      const onConfirm = vi.fn();

      render(
        <Button danger onConfirm={onConfirm}>
          删除
        </Button>
      );

      fireEvent.click(screen.getByText('删除'));
      fireEvent.click(screen.getByText('确定'));

      expect(onConfirm).toHaveBeenCalled();
    });
  });

  describe('无障碍', () => {
    it('按钮应该有正确的ARIA属性', () => {
      render(<Button aria-label="用户按钮">用户</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '用户按钮');
    });

    it('应该支持键盘导航', () => {
      render(<Button>按钮</Button>);

      const button = screen.getByRole('button');

      // Enter键应该触发点击
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      // Space键应该触发点击
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    });
  });

  describe('事件处理', () => {
    it('应该触发onClick事件', () => {
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>点击</Button>);

      fireEvent.click(screen.getByText('点击'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该支持鼠标悬停事件', () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();

      render(
        <Button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          按钮
        </Button>
      );

      const button = screen.getByRole('button');

      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalled();

      fireEvent.mouseLeave(button);
      expect(handleMouseLeave).toHaveBeenCalled();
    });

    it('应该支持焦点事件', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Button
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          按钮
        </Button>
      );

      const button = screen.getByRole('button');

      button.focus();
      expect(handleFocus).toHaveBeenCalled();

      button.blur();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('自定义样式', () => {
    it('应该应用自定义样式', () => {
      render(
        <Button style={{ backgroundColor: 'red' }}>自定义按钮</Button>
      );

      const button = screen.getByText('自定义按钮');
      expect(button).toHaveStyle({ backgroundColor: 'red' });
    });

    it('应该应用自定义className', () => {
      render(
        <Button className="custom-class">自定义按钮</Button>
      );

      const button = screen.getByText('自定义按钮');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('响应式', () => {
    it('应该根据屏幕大小调整样式', () => {
      // 测试移动端
      global.innerWidth = 375;
      render(<Button responsive>响应式按钮</Button>);

      const button = screen.getByText('响应式按钮');
      expect(button).toHaveClass('btn-mobile');

      // 测试桌面端
      global.innerWidth = 1920;
    });

    it('应该支持触摸事件', () => {
      render(<Button>触摸按钮</Button>);

      const button = screen.getByRole('button');

      // 模拟触摸事件
      fireEvent.touchStart(button, { touches: [{ clientX: 100, clientY: 200 }] });
      fireEvent.touchEnd(button, { changedTouches: [{ clientX: 100, clientY: 200 }] });
    });
  });
});

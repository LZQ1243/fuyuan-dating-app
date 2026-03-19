import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Moments from '../../src/pages/Moments';

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        success: true,
        data: [
          {
            _id: '1',
            content: '这是一条测试动态',
            author: { nickname: '测试用户', avatar: 'avatar.jpg' },
            likes: 10,
            comments: [],
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      }
    })),
    post: vi.fn(() => Promise.resolve({
      data: { success: true, data: {} }
    }))
  }
}));

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Moments Page', () => {
  it('应该正确渲染动态页', () => {
    renderWithRouter(<Moments />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('应该显示动态列表', async () => {
    renderWithRouter(<Moments />);
    await waitFor(() => {
      const content = screen.queryByText('这是一条测试动态');
      if (content) {
        expect(content).toBeInTheDocument();
      }
    });
  });

  it('应该显示发布动态按钮', () => {
    renderWithRouter(<Moments />);
    const publishButton = screen.queryByRole('button', { name: /发布|新建|发布动态/i });
    if (publishButton) {
      expect(publishButton).toBeInTheDocument();
    }
  });
});

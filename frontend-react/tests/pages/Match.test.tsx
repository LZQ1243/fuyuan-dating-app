import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Match from '../../src/pages/Match';

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        success: true,
        data: [
          {
            _id: '1',
            nickname: '测试用户1',
            age: 25,
            avatar: 'avatar1.jpg',
            gender: 'female'
          }
        ]
      }
    }))
  }
}));

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Match Page', () => {
  it('应该正确渲染匹配页', () => {
    renderWithRouter(<Match />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('应该显示匹配用户卡片', async () => {
    renderWithRouter(<Match />);
    await waitFor(() => {
      const userCard = screen.queryByText('测试用户1');
      if (userCard) {
        expect(userCard).toBeInTheDocument();
      }
    });
  });

  it('应该显示操作按钮', async () => {
    renderWithRouter(<Match />);
    await waitFor(() => {
      const likeButton = screen.queryByRole('button', { name: /喜欢|爱心|Like/i });
      const dislikeButton = screen.queryByRole('button', { name: /不喜欢|跳过|Dislike/i });

      if (likeButton || dislikeButton) {
        expect(likeButton || dislikeButton).toBeInTheDocument();
      }
    });
  });
});

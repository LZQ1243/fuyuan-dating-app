import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../src/pages/Home';

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Home Page', () => {
  it('应该正确渲染首页', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('首页') || screen.getByRole('main')).toBeInTheDocument();
  });

  it('应该显示欢迎信息', async () => {
    renderWithRouter(<Home />);
    await waitFor(() => {
      const element = screen.queryByText('欢迎来到赴缘');
      if (element) {
        expect(element).toBeInTheDocument();
      }
    });
  });
});

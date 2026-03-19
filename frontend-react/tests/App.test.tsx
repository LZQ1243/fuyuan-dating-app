import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('App Component', () => {
  it('应该正确渲染', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('应该包含路由导航', () => {
    renderWithRouter(<App />);
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });
});

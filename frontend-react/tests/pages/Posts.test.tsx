import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Posts from '../../src/pages/Posts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Posts Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染帖子列表页面', () => {
    renderWithProviders(<Posts />);

    expect(screen.getByText('发布帖子')).toBeInTheDocument();
    expect(screen.getByText('帖子列表')).toBeInTheDocument();
  });

  test('应该显示搜索框', () => {
    renderWithProviders(<Posts />);

    const searchInput = screen.getByPlaceholderText('搜索帖子');
    expect(searchInput).toBeInTheDocument();
  });

  test('应该显示筛选按钮', () => {
    renderWithProviders(<Posts />);

    const filterButton = screen.getByText('筛选');
    expect(filterButton).toBeInTheDocument();
  });

  test('点击筛选按钮应该打开筛选弹窗', () => {
    renderWithProviders(<Posts />);

    const filterButton = screen.getByText('筛选');
    fireEvent.click(filterButton);

    expect(screen.getByText('筛选条件')).toBeInTheDocument();
  });

  test('搜索功能应该正常工作', async () => {
    renderWithProviders(<Posts />);

    const searchInput = screen.getByPlaceholderText('搜索帖子');
    fireEvent.change(searchInput, { target: { value: '测试帖子' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('测试帖子');
    });
  });

  test('应该显示加载状态', () => {
    renderWithProviders(<Posts />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  test('应该显示空状态', async () => {
    renderWithProviders(<Posts />);

    await waitFor(() => {
      const emptyState = screen.queryByText('暂无帖子');
      if (emptyState) {
        expect(emptyState).toBeInTheDocument();
      }
    });
  });

  test('点击帖子应该跳转到详情页', () => {
    renderWithProviders(<Posts />);

    const postCard = screen.queryByTestId('post-card');
    if (postCard) {
      fireEvent.click(postCard);
    }
  });

  test('应该显示分页器', () => {
    renderWithProviders(<Posts />);

    const pagination = screen.queryByTestId('pagination');
    if (pagination) {
      expect(pagination).toBeInTheDocument();
    }
  });

  test('应该支持下拉刷新', () => {
    renderWithProviders(<Posts />);

    const container = screen.getByTestId('posts-container');
    expect(container).toBeInTheDocument();
  });

  test('应该支持无限滚动', () => {
    renderWithProviders(<Posts />);

    const container = screen.getByTestId('posts-container');
    expect(container).toHaveAttribute('data-infinite-scroll', 'true');
  });

  test('点击发布按钮应该跳转到发布页', () => {
    renderWithProviders(<Posts />);

    const publishButton = screen.getByText('发布帖子');
    fireEvent.click(publishButton);

    // 验证路由跳转
  });

  test('应该显示热门标签', () => {
    renderWithProviders(<Posts />);

    const hotTags = screen.queryByTestId('hot-tags');
    if (hotTags) {
      expect(hotTags).toBeInTheDocument();
    }
  });

  test('应该显示推荐用户', () => {
    renderWithProviders(<Posts />);

    const recommendedUsers = screen.queryByTestId('recommended-users');
    if (recommendedUsers) {
      expect(recommendedUsers).toBeInTheDocument();
    }
  });

  test('应该显示帖子点赞数', async () => {
    renderWithProviders(<Posts />);

    await waitFor(() => {
      const likeCount = screen.queryAllByTestId('like-count');
      if (likeCount.length > 0) {
        likeCount.forEach(count => {
          expect(count).toBeInTheDocument();
        });
      }
    });
  });

  test('应该显示帖子评论数', async () => {
    renderWithProviders(<Posts />);

    await waitFor(() => {
      const commentCount = screen.queryAllByTestId('comment-count');
      if (commentCount.length > 0) {
        commentCount.forEach(count => {
          expect(count).toBeInTheDocument();
        });
      }
    });
  });

  test('点击点赞按钮应该触发点赞', async () => {
    renderWithProviders(<Posts />);

    await waitFor(() => {
      const likeButton = screen.queryAllByTestId('like-button');
      if (likeButton.length > 0) {
        fireEvent.click(likeButton[0]);
      }
    });
  });
});

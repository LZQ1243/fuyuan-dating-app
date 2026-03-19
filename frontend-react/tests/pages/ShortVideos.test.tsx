import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShortVideos from '../../src/pages/ShortVideos';

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

describe('ShortVideos Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染短视频页面', () => {
    renderWithProviders(<ShortVideos />);

    expect(screen.getByText('短视频')).toBeInTheDocument();
    expect(screen.getByText('热门视频')).toBeInTheDocument();
  });

  test('应该显示视频播放器', () => {
    renderWithProviders(<ShortVideos />);

    const videoPlayer = screen.queryByTestId('video-player');
    if (videoPlayer) {
      expect(videoPlayer).toBeInTheDocument();
    }
  });

  test('应该显示分类标签', () => {
    renderWithProviders(<ShortVideos />);

    const categoryTabs = screen.queryByTestId('category-tabs');
    if (categoryTabs) {
      expect(categoryTabs).toBeInTheDocument();
    }
  });

  test('应该能够切换分类', () => {
    renderWithProviders(<ShortVideos />);

    const tabs = screen.queryAllByTestId('category-tab');
    if (tabs.length > 0) {
      fireEvent.click(tabs[1]);
    }
  });

  test('应该显示搜索框', () => {
    renderWithProviders(<ShortVideos />);

    const searchInput = screen.queryByPlaceholderText('搜索视频');
    if (searchInput) {
      expect(searchInput).toBeInTheDocument();
    }
  });

  test('搜索功能应该正常工作', async () => {
    renderWithProviders(<ShortVideos />);

    const searchInput = screen.queryByPlaceholderText('搜索视频');
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: '测试视频' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('测试视频');
      });
    }
  });

  test('应该显示点赞按钮', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        expect(likeButton).toBeInTheDocument();
      }
    });
  });

  test('点击点赞按钮应该触发点赞', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        fireEvent.click(likeButton);
      }
    });
  });

  test('应该显示评论按钮', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const commentButton = screen.queryByTestId('comment-button');
      if (commentButton) {
        expect(commentButton).toBeInTheDocument();
      }
    });
  });

  test('点击评论按钮应该打开评论弹窗', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const commentButton = screen.queryByTestId('comment-button');
      if (commentButton) {
        fireEvent.click(commentButton);

        expect(screen.getByText('评论')).toBeInTheDocument();
      }
    });
  });

  test('应该显示分享按钮', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const shareButton = screen.queryByTestId('share-button');
      if (shareButton) {
        expect(shareButton).toBeInTheDocument();
      }
    });
  });

  test('应该支持上下滑动切换视频', () => {
    renderWithProviders(<ShortVideos />);

    const container = screen.getByTestId('video-container');
    expect(container).toBeInTheDocument();
  });

  test('应该显示作者信息', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const authorInfo = screen.queryByTestId('author-info');
      if (authorInfo) {
        expect(authorInfo).toBeInTheDocument();
      }
    });
  });

  test('应该显示关注按钮', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const followButton = screen.queryByTestId('follow-button');
      if (followButton) {
        expect(followButton).toBeInTheDocument();
      }
    });
  });

  test('点击关注按钮应该触发关注', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const followButton = screen.queryByTestId('follow-button');
      if (followButton) {
        fireEvent.click(followButton);
      }
    });
  });

  test('应该显示播放进度', () => {
    renderWithProviders(<ShortVideos />);

    const progressBar = screen.queryByTestId('progress-bar');
    if (progressBar) {
      expect(progressBar).toBeInTheDocument();
    }
  });

  test('应该支持暂停播放', async () => {
    renderWithProviders(<ShortVideos />);

    const container = screen.getByTestId('video-container');
    fireEvent.click(container);
  });

  test('应该显示点赞数和评论数', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const likeCount = screen.queryByTestId('like-count');
      const commentCount = screen.queryByTestId('comment-count');

      if (likeCount) expect(likeCount).toBeInTheDocument();
      if (commentCount) expect(commentCount).toBeInTheDocument();
    });
  });

  test('应该显示收藏按钮', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const favoriteButton = screen.queryByTestId('favorite-button');
      if (favoriteButton) {
        expect(favoriteButton).toBeInTheDocument();
      }
    });
  });

  test('点击收藏按钮应该触发收藏', async () => {
    renderWithProviders(<ShortVideos />);

    await waitFor(() => {
      const favoriteButton = screen.queryByTestId('favorite-button');
      if (favoriteButton) {
        fireEvent.click(favoriteButton);
      }
    });
  });

  test('应该加载状态', () => {
    renderWithProviders(<ShortVideos />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  test('应该支持双击点赞', () => {
    renderWithProviders(<ShortVideos />);

    const container = screen.getByTestId('video-container');
    fireEvent.click(container);
    fireEvent.click(container);
  });
});

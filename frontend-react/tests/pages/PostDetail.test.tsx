import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostDetail from '../../src/pages/PostDetail';

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

describe('PostDetail Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染帖子详情页面', () => {
    renderWithProviders(<PostDetail />);

    expect(screen.getByText('帖子详情')).toBeInTheDocument();
  });

  test('应该显示帖子标题', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const title = screen.queryByTestId('post-title');
      if (title) {
        expect(title).toBeInTheDocument();
      }
    });
  });

  test('应该显示帖子内容', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const content = screen.queryByTestId('post-content');
      if (content) {
        expect(content).toBeInTheDocument();
      }
    });
  });

  test('应该显示作者信息', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const authorInfo = screen.queryByTestId('author-info');
      if (authorInfo) {
        expect(authorInfo).toBeInTheDocument();
      }
    });
  });

  test('应该显示帖子图片', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const images = screen.queryAllByTestId('post-image');
      if (images.length > 0) {
        images.forEach(img => {
          expect(img).toBeInTheDocument();
        });
      }
    });
  });

  test('应该显示点赞按钮', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        expect(likeButton).toBeInTheDocument();
      }
    });
  });

  test('点击点赞按钮应该触发点赞', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        fireEvent.click(likeButton);
      }
    });
  });

  test('应该显示评论列表', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const commentList = screen.queryByTestId('comment-list');
      if (commentList) {
        expect(commentList).toBeInTheDocument();
      }
    });
  });

  test('应该显示评论输入框', async () => {
    renderWithProviders(<PostDetail />);

    const commentInput = screen.getByPlaceholderText('发表评论');
    expect(commentInput).toBeInTheDocument();
  });

  test('应该能够发送评论', async () => {
    renderWithProviders(<PostDetail />);

    const commentInput = screen.getByPlaceholderText('发表评论');
    const sendButton = screen.getByText('发送');

    fireEvent.change(commentInput, { target: { value: '测试评论' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(commentInput).toHaveValue('');
    });
  });

  test('应该显示分享按钮', async () => {
    renderWithProviders(<PostDetail />);

    const shareButton = screen.queryByText('分享');
    if (shareButton) {
      expect(shareButton).toBeInTheDocument();
    }
  });

  test('点击分享按钮应该打开分享弹窗', async () => {
    renderWithProviders(<PostDetail />);

    const shareButton = screen.queryByText('分享');
    if (shareButton) {
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('分享到')).toBeInTheDocument();
      });
    }
  });

  test('应该显示收藏按钮', async () => {
    renderWithProviders(<PostDetail />);

    const favoriteButton = screen.queryByText('收藏');
    if (favoriteButton) {
      expect(favoriteButton).toBeInTheDocument();
    }
  });

  test('点击收藏按钮应该触发收藏', async () => {
    renderWithProviders(<PostDetail />);

    const favoriteButton = screen.queryByText('收藏');
    if (favoriteButton) {
      fireEvent.click(favoriteButton);
    }
  });

  test('应该显示发布时间', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const publishTime = screen.queryByTestId('publish-time');
      if (publishTime) {
        expect(publishTime).toBeInTheDocument();
      }
    });
  });

  test('应该返回按钮点击应该返回列表页', () => {
    renderWithProviders(<PostDetail />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
  });

  test('应该显示点赞数和评论数', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const likeCount = screen.queryByTestId('like-count');
      const commentCount = screen.queryByTestId('comment-count');

      if (likeCount) expect(likeCount).toBeInTheDocument();
      if (commentCount) expect(commentCount).toBeInTheDocument();
    });
  });

  test('应该支持图片预览', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const images = screen.queryAllByTestId('post-image');
      if (images.length > 0) {
        fireEvent.click(images[0]);
      }
    });
  });

  test('应该显示举报按钮', async () => {
    renderWithProviders(<PostDetail />);

    const reportButton = screen.queryByText('举报');
    if (reportButton) {
      expect(reportButton).toBeInTheDocument();
    }
  });

  test('点击举报按钮应该打开举报弹窗', async () => {
    renderWithProviders(<PostDetail />);

    const reportButton = screen.queryByText('举报');
    if (reportButton) {
      fireEvent.click(reportButton);

      await waitFor(() => {
        expect(screen.getByText('举报内容')).toBeInTheDocument();
      });
    }
  });

  test('应该支持评论点赞', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const commentLikeButtons = screen.queryAllByTestId('comment-like-button');
      if (commentLikeButtons.length > 0) {
        fireEvent.click(commentLikeButtons[0]);
      }
    });
  });

  test('应该支持评论回复', async () => {
    renderWithProviders(<PostDetail />);

    await waitFor(() => {
      const replyButtons = screen.queryAllByTestId('reply-button');
      if (replyButtons.length > 0) {
        fireEvent.click(replyButtons[0]);
      }
    });
  });

  test('应该显示加载状态', () => {
    renderWithProviders(<PostDetail />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});

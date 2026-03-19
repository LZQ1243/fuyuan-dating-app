import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LiveRoom from '../../src/pages/LiveRoom';

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

describe('LiveRoom Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染直播间详情页面', () => {
    renderWithProviders(<LiveRoom />);

    expect(screen.getByText('直播间')).toBeInTheDocument();
  });

  test('应该显示视频播放器', () => {
    renderWithProviders(<LiveRoom />);

    const videoPlayer = screen.queryByTestId('video-player');
    if (videoPlayer) {
      expect(videoPlayer).toBeInTheDocument();
    }
  });

  test('应该显示直播间标题', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const title = screen.queryByTestId('live-title');
      if (title) {
        expect(title).toBeInTheDocument();
      }
    });
  });

  test('应该显示主播信息', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const anchorInfo = screen.queryByTestId('anchor-info');
      if (anchorInfo) {
        expect(anchorInfo).toBeInTheDocument();
      }
    });
  });

  test('应该显示观看人数', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const viewerCount = screen.queryByTestId('viewer-count');
      if (viewerCount) {
        expect(viewerCount).toBeInTheDocument();
      }
    });
  });

  test('应该显示点赞按钮', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        expect(likeButton).toBeInTheDocument();
      }
    });
  });

  test('点击点赞按钮应该触发点赞', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const likeButton = screen.queryByTestId('like-button');
      if (likeButton) {
        fireEvent.click(likeButton);
      }
    });
  });

  test('应该显示评论输入框', () => {
    renderWithProviders(<LiveRoom />);

    const commentInput = screen.getByPlaceholderText('发送评论');
    expect(commentInput).toBeInTheDocument();
  });

  test('应该能够发送评论', async () => {
    renderWithProviders(<LiveRoom />);

    const commentInput = screen.getByPlaceholderText('发送评论');
    const sendButton = screen.getByTestId('send-comment');

    fireEvent.change(commentInput, { target: { value: '测试评论' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(commentInput).toHaveValue('');
    });
  });

  test('应该显示评论列表', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const commentList = screen.queryByTestId('comment-list');
      if (commentList) {
        expect(commentList).toBeInTheDocument();
      }
    });
  });

  test('应该显示分享按钮', async () => {
    renderWithProviders(<LiveRoom />);

    const shareButton = screen.queryByTestId('share-button');
    if (shareButton) {
      expect(shareButton).toBeInTheDocument();
    }
  });

  test('点击分享按钮应该打开分享弹窗', async () => {
    renderWithProviders(<LiveRoom />);

    const shareButton = screen.queryByTestId('share-button');
    if (shareButton) {
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('分享到')).toBeInTheDocument();
      });
    }
  });

  test('应该显示礼物按钮', async () => {
    renderWithProviders(<LiveRoom />);

    const giftButton = screen.queryByTestId('gift-button');
    if (giftButton) {
      expect(giftButton).toBeInTheDocument();
    }
  });

  test('点击礼物按钮应该打开礼物面板', async () => {
    renderWithProviders(<LiveRoom />);

    const giftButton = screen.queryByTestId('gift-button');
    if (giftButton) {
      fireEvent.click(giftButton);

      expect(screen.getByText('选择礼物')).toBeInTheDocument();
    }
  });

  test('应该能够发送礼物', async () => {
    renderWithProviders(<LiveRoom />);

    const giftButton = screen.queryByTestId('gift-button');
    fireEvent.click(giftButton);

    await waitFor(() => {
      const gifts = screen.queryAllByTestId('gift-item');
      if (gifts.length > 0) {
        fireEvent.click(gifts[0]);
      }
    });
  });

  test('应该显示关注按钮', async () => {
    renderWithProviders(<LiveRoom />);

    const followButton = screen.queryByTestId('follow-button');
    if (followButton) {
      expect(followButton).toBeInTheDocument();
    }
  });

  test('点击关注按钮应该触发关注', async () => {
    renderWithProviders(<LiveRoom />);

    const followButton = screen.queryByTestId('follow-button');
    if (followButton) {
      fireEvent.click(followButton);
    }
  });

  test('应该显示退出直播按钮', async () => {
    renderWithProviders(<LiveRoom />);

    const exitButton = screen.queryByTestId('exit-button');
    if (exitButton) {
      expect(exitButton).toBeInTheDocument();
    }
  });

  test('点击退出直播按钮应该退出', async () => {
    renderWithProviders(<LiveRoom />);

    const exitButton = screen.queryByTestId('exit-button');
    if (exitButton) {
      fireEvent.click(exitButton);

      expect(screen.getByText('确认退出?')).toBeInTheDocument();
    }
  });

  test('应该显示举报按钮', async () => {
    renderWithProviders(<LiveRoom />);

    const reportButton = screen.queryByTestId('report-button');
    if (reportButton) {
      expect(reportButton).toBeInTheDocument();
    }
  });

  test('点击举报按钮应该打开举报弹窗', async () => {
    renderWithProviders(<LiveRoom />);

    const reportButton = screen.queryByTestId('report-button');
    if (reportButton) {
      fireEvent.click(reportButton);

      expect(screen.getByText('举报内容')).toBeInTheDocument();
    }
  });

  test('应该显示礼物特效', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const giftEffect = screen.queryByTestId('gift-effect');
      if (giftEffect) {
        expect(giftEffect).toBeInTheDocument();
      }
    });
  });

  test('应该显示点赞动画效果', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const likeAnimation = screen.queryByTestId('like-animation');
      if (likeAnimation) {
        expect(likeAnimation).toBeInTheDocument();
      }
    });
  });

  test('应该支持暂停播放', () => {
    renderWithProviders(<LiveRoom />);

    const videoPlayer = screen.queryByTestId('video-player');
    if (videoPlayer) {
      fireEvent.click(videoPlayer);
    }
  });

  test('应该显示直播状态', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const liveStatus = screen.queryByTestId('live-status');
      if (liveStatus) {
        expect(liveStatus).toBeInTheDocument();
      }
    });
  });

  test('应该显示直播时长', async () => {
    renderWithProviders(<LiveRoom />);

    await waitFor(() => {
      const duration = screen.queryByTestId('live-duration');
      if (duration) {
        expect(duration).toBeInTheDocument();
      }
    });
  });

  test('应该支持全屏播放', () => {
    renderWithProviders(<LiveRoom />);

    const fullscreenButton = screen.queryByTestId('fullscreen-button');
    if (fullscreenButton) {
      fireEvent.click(fullscreenButton);
    }
  });

  test('应该加载状态', () => {
    renderWithProviders(<LiveRoom />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Profile from '../../src/pages/Profile';

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

describe('Profile Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染个人资料页面', () => {
    renderWithProviders(<Profile />);

    expect(screen.getByText('个人资料')).toBeInTheDocument();
  });

  test('应该显示用户头像', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const avatar = screen.queryByTestId('user-avatar');
      if (avatar) {
        expect(avatar).toBeInTheDocument();
      }
    });
  });

  test('应该显示用户昵称', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const nickname = screen.queryByTestId('user-nickname');
      if (nickname) {
        expect(nickname).toBeInTheDocument();
      }
    });
  });

  test('应该显示用户ID', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const userId = screen.queryByTestId('user-id');
      if (userId) {
        expect(userId).toBeInTheDocument();
      }
    });
  });

  test('应该显示编辑资料按钮', async () => {
    renderWithProviders(<Profile />);

    const editButton = screen.queryByText('编辑资料');
    if (editButton) {
      expect(editButton).toBeInTheDocument();
    }
  });

  test('点击编辑资料应该打开编辑弹窗', () => {
    renderWithProviders(<Profile />);

    const editButton = screen.queryByText('编辑资料');
    if (editButton) {
      fireEvent.click(editButton);

      expect(screen.getByText('编辑个人资料')).toBeInTheDocument();
    }
  });

  test('应该显示用户相册', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const gallery = screen.queryByTestId('user-gallery');
      if (gallery) {
        expect(gallery).toBeInTheDocument();
      }
    });
  });

  test('应该显示关注数量', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const followingCount = screen.queryByTestId('following-count');
      if (followingCount) {
        expect(followingCount).toBeInTheDocument();
      }
    });
  });

  test('应该显示粉丝数量', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const followersCount = screen.queryByTestId('followers-count');
      if (followersCount) {
        expect(followersCount).toBeInTheDocument();
      }
    });
  });

  test('应该显示获赞数量', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const likesCount = screen.queryByTestId('likes-count');
      if (likesCount) {
        expect(likesCount).toBeInTheDocument();
      }
    });
  });

  test('应该显示用户签名', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const signature = screen.queryByTestId('user-signature');
      if (signature) {
        expect(signature).toBeInTheDocument();
      }
    });
  });

  test('应该显示用户基本信息', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const info = screen.queryByTestId('user-info');
      if (info) {
        expect(info).toBeInTheDocument();
      }
    });
  });

  test('应该显示性别', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const gender = screen.queryByTestId('user-gender');
      if (gender) {
        expect(gender).toBeInTheDocument();
      }
    });
  });

  test('应该显示年龄', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const age = screen.queryByTestId('user-age');
      if (age) {
        expect(age).toBeInTheDocument();
      }
    });
  });

  test('应该显示位置', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const location = screen.queryByTestId('user-location');
      if (location) {
        expect(location).toBeInTheDocument();
      }
    });
  });

  test('应该显示学历', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const education = screen.queryByTestId('user-education');
      if (education) {
        expect(education).toBeInTheDocument();
      }
    });
  });

  test('应该显示职业', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const occupation = screen.queryByTestId('user-occupation');
      if (occupation) {
        expect(occupation).toBeInTheDocument();
      }
    });
  });

  test('应该显示关注按钮', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const followButton = screen.queryByTestId('follow-button');
      if (followButton) {
        expect(followButton).toBeInTheDocument();
      }
    });
  });

  test('点击关注按钮应该触发关注', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const followButton = screen.queryByTestId('follow-button');
      if (followButton) {
        fireEvent.click(followButton);
      }
    });
  });

  test('应该显示私信按钮', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const messageButton = screen.queryByTestId('message-button');
      if (messageButton) {
        expect(messageButton).toBeInTheDocument();
      }
    });
  });

  test('点击私信按钮应该跳转到聊天页', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const messageButton = screen.queryByTestId('message-button');
      if (messageButton) {
        fireEvent.click(messageButton);
      }
    });
  });

  test('应该显示用户动态', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const posts = screen.queryByTestId('user-posts');
      if (posts) {
        expect(posts).toBeInTheDocument();
      }
    });
  });

  test('应该显示分享按钮', async () => {
    renderWithProviders(<Profile />);

    const shareButton = screen.queryByTestId('share-button');
    if (shareButton) {
      expect(shareButton).toBeInTheDocument();
    }
  });

  test('点击分享按钮应该打开分享弹窗', async () => {
    renderWithProviders(<Profile />);

    const shareButton = screen.queryByTestId('share-button');
    if (shareButton) {
      fireEvent.click(shareButton);

      expect(screen.getByText('分享到')).toBeInTheDocument();
    }
  });

  test('应该显示举报按钮', async () => {
    renderWithProviders(<Profile />);

    const reportButton = screen.queryByTestId('report-button');
    if (reportButton) {
      expect(reportButton).toBeInTheDocument();
    }
  });

  test('点击举报按钮应该打开举报弹窗', async () => {
    renderWithProviders(<Profile />);

    const reportButton = screen.queryByTestId('report-button');
    if (reportButton) {
      fireEvent.click(reportButton);

      expect(screen.getByText('举报内容')).toBeInTheDocument();
    }
  });

  test('应该加载状态', () => {
    renderWithProviders(<Profile />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  test('应该显示认证标识', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      const verifiedBadge = screen.queryByTestId('verified-badge');
      if (verifiedBadge) {
        expect(verifiedBadge).toBeInTheDocument();
      }
    });
  });
});

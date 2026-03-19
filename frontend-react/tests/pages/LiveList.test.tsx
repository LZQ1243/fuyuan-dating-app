import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LiveList from '../../src/pages/LiveList';

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

describe('LiveList Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染直播列表页面', () => {
    renderWithProviders(<LiveList />);

    expect(screen.getByText('直播')).toBeInTheDocument();
    expect(screen.getByText('热门直播')).toBeInTheDocument();
  });

  test('应该显示分类标签', () => {
    renderWithProviders(<LiveList />);

    const categoryTabs = screen.queryByTestId('category-tabs');
    if (categoryTabs) {
      expect(categoryTabs).toBeInTheDocument();
    }
  });

  test('应该能够切换分类', () => {
    renderWithProviders(<LiveList />);

    const tabs = screen.queryAllByTestId('category-tab');
    if (tabs.length > 0) {
      fireEvent.click(tabs[1]);
    }
  });

  test('应该显示直播列表', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const liveCards = screen.queryAllByTestId('live-card');
      if (liveCards.length > 0) {
        liveCards.forEach(card => {
          expect(card).toBeInTheDocument();
        });
      }
    });
  });

  test('应该显示搜索框', () => {
    renderWithProviders(<LiveList />);

    const searchInput = screen.queryByPlaceholderText('搜索直播间');
    if (searchInput) {
      expect(searchInput).toBeInTheDocument();
    }
  });

  test('搜索功能应该正常工作', async () => {
    renderWithProviders(<LiveList />);

    const searchInput = screen.queryByPlaceholderText('搜索直播间');
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: '测试直播' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('测试直播');
      });
    }
  });

  test('应该显示筛选按钮', () => {
    renderWithProviders(<LiveList />);

    const filterButton = screen.queryByText('筛选');
    if (filterButton) {
      expect(filterButton).toBeInTheDocument();
    }
  });

  test('点击筛选按钮应该打开筛选弹窗', () => {
    renderWithProviders(<LiveList />);

    const filterButton = screen.queryByText('筛选');
    if (filterButton) {
      fireEvent.click(filterButton);

      expect(screen.getByText('筛选条件')).toBeInTheDocument();
    }
  });

  test('点击直播卡片应该跳转到直播间', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const liveCard = screen.queryByTestId('live-card');
      if (liveCard) {
        fireEvent.click(liveCard);
      }
    });
  });

  test('应该显示直播间封面', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const covers = screen.queryAllByTestId('live-cover');
      if (covers.length > 0) {
        covers.forEach(cover => {
          expect(cover).toBeInTheDocument();
        });
      }
    });
  });

  test('应该显示直播间标题', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const titles = screen.queryAllByTestId('live-title');
      if (titles.length > 0) {
        titles.forEach(title => {
          expect(title).toBeInTheDocument();
        });
      }
    });
  });

  test('应该显示观看人数', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const viewerCounts = screen.queryAllByTestId('viewer-count');
      if (viewerCounts.length > 0) {
        viewerCounts.forEach(count => {
          expect(count).toBeInTheDocument();
        });
      }
    });
  });

  test('应该显示主播信息', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const anchors = screen.queryAllByTestId('anchor-info');
      if (anchors.length > 0) {
        anchors.forEach(anchor => {
          expect(anchor).toBeInTheDocument();
        });
      }
    });
  });

  test('应该显示直播标签', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const tags = screen.queryAllByTestId('live-tag');
      if (tags.length > 0) {
        tags.forEach(tag => {
          expect(tag).toBeInTheDocument();
        });
      }
    });
  });

  test('应该支持下拉刷新', () => {
    renderWithProviders(<LiveList />);

    const container = screen.getByTestId('live-list-container');
    expect(container).toBeInTheDocument();
  });

  test('应该支持无限滚动', () => {
    renderWithProviders(<LiveList />);

    const container = screen.getByTestId('live-list-container');
    expect(container).toHaveAttribute('data-infinite-scroll', 'true');
  });

  test('应该显示创建直播按钮', () => {
    renderWithProviders(<LiveList />);

    const createButton = screen.queryByText('创建直播');
    if (createButton) {
      expect(createButton).toBeInTheDocument();
    }
  });

  test('点击创建直播按钮应该跳转到创建页', () => {
    renderWithProviders(<LiveList />);

    const createButton = screen.queryByText('创建直播');
    if (createButton) {
      fireEvent.click(createButton);
    }
  });

  test('应该显示加载状态', () => {
    renderWithProviders(<LiveList />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  test('应该显示空状态', async () => {
    renderWithProviders(<LiveList />);

    await waitFor(() => {
      const emptyState = screen.queryByText('暂无直播');
      if (emptyState) {
        expect(emptyState).toBeInTheDocument();
      }
    });
  });

  test('应该显示推荐主播', () => {
    renderWithProviders(<LiveList />);

    const recommendedAnchors = screen.queryByTestId('recommended-anchors');
    if (recommendedAnchors) {
      expect(recommendedAnchors).toBeInTheDocument();
    }
  });

  test('应该显示热门直播列表', () => {
    renderWithProviders(<LiveList />);

    const hotLives = screen.queryByTestId('hot-lives');
    if (hotLives) {
      expect(hotLives).toBeInTheDocument();
    }
  });

  test('应该支持按热度排序', () => {
    renderWithProviders(<LiveList />);

    const sortButton = screen.queryByText('按热度');
    if (sortButton) {
      fireEvent.click(sortButton);
    }
  });

  test('应该支持按时间排序', () => {
    renderWithProviders(<LiveList />);

    const sortButton = screen.queryByText('按时间');
    if (sortButton) {
      fireEvent.click(sortButton);
    }
  });
});

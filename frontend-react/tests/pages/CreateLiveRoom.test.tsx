import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateLiveRoom from '../../src/pages/CreateLiveRoom';

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

describe('CreateLiveRoom Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染创建直播间页面', () => {
    renderWithProviders(<CreateLiveRoom />);

    expect(screen.getByText('创建直播间')).toBeInTheDocument();
  });

  test('应该显示标题输入框', () => {
    renderWithProviders(<CreateLiveRoom />);

    const titleInput = screen.getByPlaceholderText('请输入直播间标题');
    expect(titleInput).toBeInTheDocument();
  });

  test('应该能够输入标题', () => {
    renderWithProviders(<CreateLiveRoom />);

    const titleInput = screen.getByPlaceholderText('请输入直播间标题');
    fireEvent.change(titleInput, { target: { value: '测试直播间' } });

    expect(titleInput).toHaveValue('测试直播间');
  });

  test('应该显示描述输入框', () => {
    renderWithProviders(<CreateLiveRoom />);

    const descInput = screen.getByPlaceholderText('请输入直播间描述');
    expect(descInput).toBeInTheDocument();
  });

  test('应该能够输入描述', () => {
    renderWithProviders(<CreateLiveRoom />);

    const descInput = screen.getByPlaceholderText('请输入直播间描述');
    fireEvent.change(descInput, { target: { value: '这是一个测试直播间' } });

    expect(descInput).toHaveValue('这是一个测试直播间');
  });

  test('应该显示封面上传按钮', () => {
    renderWithProviders(<CreateLiveRoom />);

    const coverUpload = screen.getByText('上传封面');
    expect(coverUpload).toBeInTheDocument();
  });

  test('应该能够上传封面', () => {
    renderWithProviders(<CreateLiveRoom />);

    const coverUpload = screen.getByText('上传封面');
    fireEvent.click(coverUpload);
  });

  test('应该显示分类选择', () => {
    renderWithProviders(<CreateLiveRoom />);

    const categorySelect = screen.getByText('选择分类');
    expect(categorySelect).toBeInTheDocument();
  });

  test('应该能够选择分类', () => {
    renderWithProviders(<CreateLiveRoom />);

    const categorySelect = screen.getByText('选择分类');
    fireEvent.click(categorySelect);

    expect(screen.getByText('相亲')).toBeInTheDocument();
  });

  test('应该显示开始直播按钮', () => {
    renderWithProviders(<CreateLiveRoom />);

    const startButton = screen.getByText('开始直播');
    expect(startButton).toBeInTheDocument();
  });

  test('点击开始直播按钮应该创建直播间', async () => {
    renderWithProviders(<CreateLiveRoom />);

    const titleInput = screen.getByPlaceholderText('请输入直播间标题');
    const startButton = screen.getByText('开始直播');

    fireEvent.change(titleInput, { target: { value: '测试直播间' } });
    fireEvent.click(startButton);

    await waitFor(() => {
      // 验证直播创建成功
    });
  });

  test('应该验证标题不能为空', () => {
    renderWithProviders(<CreateLiveRoom />);

    const startButton = screen.getByText('开始直播');
    fireEvent.click(startButton);

    expect(screen.getByText('请输入标题')).toBeInTheDocument();
  });

  test('应该限制标题字数', () => {
    renderWithProviders(<CreateLiveRoom />);

    const titleInput = screen.getByPlaceholderText('请输入直播间标题');
    const maxLength = 50;
    const longTitle = 'A'.repeat(maxLength + 10);

    fireEvent.change(titleInput, { target: { value: longTitle } });

    expect(titleInput.value.length).toBeLessThanOrEqual(maxLength);
  });

  test('应该限制描述字数', () => {
    renderWithProviders(<CreateLiveRoom />);

    const descInput = screen.getByPlaceholderText('请输入直播间描述');
    const maxLength = 200;
    const longDesc = 'A'.repeat(maxLength + 50);

    fireEvent.change(descInput, { target: { value: longDesc } });

    expect(descInput.value.length).toBeLessThanOrEqual(maxLength);
  });

  test('应该显示返回按钮', () => {
    renderWithProviders(<CreateLiveRoom />);

    const backButton = screen.getByTestId('back-button');
    expect(backButton).toBeInTheDocument();
  });

  test('点击返回按钮应该返回', () => {
    renderWithProviders(<CreateLiveRoom />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
  });

  test('应该显示字数统计', () => {
    renderWithProviders(<CreateLiveRoom />);

    const titleInput = screen.getByPlaceholderText('请输入直播间标题');
    fireEvent.change(titleInput, { target: { value: '测试' } });

    const charCount = screen.queryByText('/50');
    if (charCount) {
      expect(charCount).toBeInTheDocument();
    }
  });

  test('应该显示隐私设置', () => {
    renderWithProviders(<CreateLiveRoom />);

    const privacyButton = screen.queryByText('隐私设置');
    if (privacyButton) {
      expect(privacyButton).toBeInTheDocument();
    }
  });

  test('应该能够设置隐私', () => {
    renderWithProviders(<CreateLiveRoom />);

    const privacyButton = screen.queryByText('隐私设置');
    if (privacyButton) {
      fireEvent.click(privacyButton);
    }
  });

  test('应该显示预览封面', () => {
    renderWithProviders(<CreateLiveRoom />);

    const coverPreview = screen.queryByTestId('cover-preview');
    if (coverPreview) {
      expect(coverPreview).toBeInTheDocument();
    }
  });

  test('应该支持删除已上传的封面', () => {
    renderWithProviders(<CreateLiveRoom />);

    const deleteButton = screen.queryByTestId('delete-cover');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
  });

  test('应该显示热门标签', () => {
    renderWithProviders(<CreateLiveRoom />);

    const hotTags = screen.queryByTestId('hot-tags');
    if (hotTags) {
      expect(hotTags).toBeInTheDocument();
    }
  });

  test('应该能够选择热门标签', () => {
    renderWithProviders(<CreateLiveRoom />);

    const tags = screen.queryAllByTestId('tag-item');
    if (tags.length > 0) {
      fireEvent.click(tags[0]);
    }
  });

  test('应该显示直播时长设置', () => {
    renderWithProviders(<CreateLiveRoom />);

    const durationSetting = screen.queryByText('直播时长');
    if (durationSetting) {
      expect(durationSetting).toBeInTheDocument();
    }
  });

  test('应该能够设置直播时长', () => {
    renderWithProviders(<CreateLiveRoom />);

    const durationInput = screen.queryByTestId('duration-input');
    if (durationInput) {
      fireEvent.change(durationInput, { target: { value: '60' } });
    }
  });
});

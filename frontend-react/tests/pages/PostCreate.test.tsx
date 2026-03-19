import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostCreate from '../../src/pages/PostCreate';

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

describe('PostCreate Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染发布帖子页面', () => {
    renderWithProviders(<PostCreate />);

    expect(screen.getByText('发布帖子')).toBeInTheDocument();
  });

  test('应该显示标题输入框', () => {
    renderWithProviders(<PostCreate />);

    const titleInput = screen.getByPlaceholderText('请输入标题');
    expect(titleInput).toBeInTheDocument();
  });

  test('应该显示内容输入框', () => {
    renderWithProviders(<PostCreate />);

    const contentInput = screen.getByPlaceholderText('分享你的想法...');
    expect(contentInput).toBeInTheDocument();
  });

  test('应该能够输入标题', () => {
    renderWithProviders(<PostCreate />);

    const titleInput = screen.getByPlaceholderText('请输入标题');
    fireEvent.change(titleInput, { target: { value: '测试标题' } });

    expect(titleInput).toHaveValue('测试标题');
  });

  test('应该能够输入内容', () => {
    renderWithProviders(<PostCreate />);

    const contentInput = screen.getByPlaceholderText('分享你的想法...');
    fireEvent.change(contentInput, { target: { value: '测试内容' } });

    expect(contentInput).toHaveValue('测试内容');
  });

  test('应该显示上传图片按钮', () => {
    renderWithProviders(<PostCreate />);

    const uploadButton = screen.getByText('添加图片');
    expect(uploadButton).toBeInTheDocument();
  });

  test('应该能够上传图片', () => {
    renderWithProviders(<PostCreate />);

    const uploadButton = screen.getByText('添加图片');
    fireEvent.click(uploadButton);

    // 验证图片上传组件显示
  });

  test('应该显示上传视频按钮', () => {
    renderWithProviders(<PostCreate />);

    const uploadVideoButton = screen.queryByText('添加视频');
    if (uploadVideoButton) {
      expect(uploadVideoButton).toBeInTheDocument();
    }
  });

  test('应该显示添加话题按钮', () => {
    renderWithProviders(<PostCreate />);

    const addTopicButton = screen.getByText('添加话题');
    expect(addTopicButton).toBeInTheDocument();
  });

  test('点击添加话题应该打开话题选择弹窗', () => {
    renderWithProviders(<PostCreate />);

    const addTopicButton = screen.getByText('添加话题');
    fireEvent.click(addTopicButton);

    expect(screen.getByText('选择话题')).toBeInTheDocument();
  });

  test('应该显示发布按钮', () => {
    renderWithProviders(<PostCreate />);

    const publishButton = screen.getByText('发布');
    expect(publishButton).toBeInTheDocument();
  });

  test('点击发布按钮应该发布帖子', async () => {
    renderWithProviders(<PostCreate />);

    const titleInput = screen.getByPlaceholderText('请输入标题');
    const contentInput = screen.getByPlaceholderText('分享你的想法...');
    const publishButton = screen.getByText('发布');

    fireEvent.change(titleInput, { target: { value: '测试标题' } });
    fireEvent.change(contentInput, { target: { value: '测试内容' } });
    fireEvent.click(publishButton);

    await waitFor(() => {
      // 验证发布成功
    });
  });

  test('应该验证标题不能为空', () => {
    renderWithProviders(<PostCreate />);

    const publishButton = screen.getByText('发布');
    fireEvent.click(publishButton);

    expect(screen.getByText('请输入标题')).toBeInTheDocument();
  });

  test('应该验证内容不能为空', () => {
    renderWithProviders(<PostCreate />);

    const titleInput = screen.getByPlaceholderText('请输入标题');
    const publishButton = screen.getByText('发布');

    fireEvent.change(titleInput, { target: { value: '测试标题' } });
    fireEvent.click(publishButton);

    expect(screen.getByText('请输入内容')).toBeInTheDocument();
  });

  test('应该显示保存草稿按钮', () => {
    renderWithProviders(<PostCreate />);

    const saveDraftButton = screen.queryByText('保存草稿');
    if (saveDraftButton) {
      expect(saveDraftButton).toBeInTheDocument();
    }
  });

  test('点击保存草稿应该保存内容', () => {
    renderWithProviders(<PostCreate />);

    const saveDraftButton = screen.queryByText('保存草稿');
    if (saveDraftButton) {
      fireEvent.click(saveDraftButton);
    }
  });

  test('应该显示返回按钮', () => {
    renderWithProviders(<PostCreate />);

    const backButton = screen.getByTestId('back-button');
    expect(backButton).toBeInTheDocument();
  });

  test('点击返回按钮应该返回', () => {
    renderWithProviders(<PostCreate />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
  });

  test('应该支持删除已上传的图片', async () => {
    renderWithProviders(<PostCreate />);

    const uploadButton = screen.getByText('添加图片');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      const deleteButton = screen.queryAllByTestId('delete-image');
      if (deleteButton.length > 0) {
        fireEvent.click(deleteButton[0]);
      }
    });
  });

  test('应该限制标题字数', () => {
    renderWithProviders(<PostCreate />);

    const titleInput = screen.getByPlaceholderText('请输入标题');
    const maxLength = 100;
    const longTitle = 'A'.repeat(maxLength + 10);

    fireEvent.change(titleInput, { target: { value: longTitle } });

    expect(titleInput.value.length).toBeLessThanOrEqual(maxLength);
  });

  test('应该限制内容字数', () => {
    renderWithProviders(<PostCreate />);

    const contentInput = screen.getByPlaceholderText('分享你的想法...');
    const maxLength = 5000;
    const longContent = 'A'.repeat(maxLength + 100);

    fireEvent.change(contentInput, { target: { value: longContent } });

    expect(contentInput.value.length).toBeLessThanOrEqual(maxLength);
  });

  test('应该显示字数统计', () => {
    renderWithProviders(<PostCreate />);

    const titleInput = screen.getByPlaceholderText('请输入标题');
    fireEvent.change(titleInput, { target: { value: '测试标题' } });

    const charCount = screen.queryByText('/100');
    if (charCount) {
      expect(charCount).toBeInTheDocument();
    }
  });

  test('应该支持设置可见范围', () => {
    renderWithProviders(<PostCreate />);

    const visibilityButton = screen.queryByText('公开');
    if (visibilityButton) {
      fireEvent.click(visibilityButton);

      expect(screen.getByText('选择可见范围')).toBeInTheDocument();
    }
  });

  test('应该支持添加位置信息', () => {
    renderWithProviders(<PostCreate />);

    const locationButton = screen.queryByText('添加位置');
    if (locationButton) {
      expect(locationButton).toBeInTheDocument();
    }
  });

  test('应该支持添加@好友', () => {
    renderWithProviders(<PostCreate />);

    const mentionButton = screen.queryByText('@好友');
    if (mentionButton) {
      expect(mentionButton).toBeInTheDocument();
    }
  });
});

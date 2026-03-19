import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditProfile from '../../pages/EditProfile';

// Mock API
vi.mock('../../api/user', () => ({
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
  uploadImages: vi.fn()
}));

// Mock Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...require('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('EditProfile页面测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('页面渲染', () => {
    it('应该正确渲染编辑资料页面', () => {
      render(<EditProfile />);

      expect(screen.getByText('编辑资料')).toBeInTheDocument();
      expect(screen.getByText('基本信息')).toBeInTheDocument();
      expect(screen.getByText('头像')).toBeInTheDocument();
      expect(screen.getByText('昵称')).toBeInTheDocument();
      expect(screen.getByText('性别')).toBeInTheDocument();
      expect(screen.getByText('年龄')).toBeInTheDocument();
      expect(screen.getByText('地区')).toBeInTheDocument();
    });

    it('应该显示保存按钮', () => {
      render(<EditProfile />);

      const button = screen.getByRole('button', { name: '保存' });
      expect(button).toBeInTheDocument();
    });

    it('应该显示取消按钮', () => {
      render(<EditProfile />);

      const button = screen.getByRole('button', { name: '取消' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('头像上传', () => {
    it('应该支持选择头像文件', async () => {
      render(<EditProfile />);

      const avatarInput = screen.getByAltText('头像');
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });

      fireEvent.change(avatarInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/正在上传/)).toBeInTheDocument();
      });
    });

    it('应该支持裁剪头像', async () => {
      render(<EditProfile />);

      const cropButton = screen.getByText('裁剪');

      expect(cropButton).toBeInTheDocument();
    });

    it('头像上传成功后应该显示预览', async () => {
      const { uploadAvatar } = require('../../api/user');
      uploadAvatar.mockResolvedValue({ success: true, url: 'avatar-url.jpg' });

      render(<EditProfile />);

      const avatarInput = screen.getByAltText('头像');
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });

      fireEvent.change(avatarInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText('头像预览')).toHaveAttribute('src', 'avatar-url.jpg');
      });
    });

    it('头像上传失败时应该显示错误', async () => {
      const { uploadAvatar } = require('../../api/user');
      uploadAvatar.mockRejectedValue(new Error('Upload failed'));

      render(<EditProfile />);

      const avatarInput = screen.getByAltText('头像');
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });

      fireEvent.change(avatarInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('头像上传失败')).toBeInTheDocument();
      });
    });
  });

  describe('基本信息编辑', () => {
    it('应该能够修改昵称', async () => {
      render(<EditProfile />);

      const nicknameInput = screen.getByPlaceholderText('昵称');
      fireEvent.change(nicknameInput, '新昵称');

      expect(nicknameInput).toHaveValue('新昵称');
    });

    it('昵称不能为空', async () => {
      render(<EditProfile />);

      const nicknameInput = screen.getByPlaceholderText('昵称');
      fireEvent.change(nicknameInput, '');
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.getByText('昵称不能为空')).toBeInTheDocument();
      });
    });

    it('昵称长度不能超过20字', async () => {
      render(<EditProfile />);

      const nicknameInput = screen.getByPlaceholderText('昵称');
      const longNickname = 'a'.repeat(21);
      fireEvent.change(nicknameInput, longNickname);
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.getByText('昵称不能超过20个字')).toBeInTheDocument();
      });
    });

    it('应该能够选择性别', async () => {
      render(<EditProfile />);

      const genderSelect = screen.getByText('性别');
      fireEvent.click(genderSelect);

      await waitFor(() => {
        expect(screen.getByText('男')).toBeInTheDocument();
        expect(screen.getByText('女')).toBeInTheDocument();
      });
    });

    it('应该能够输入年龄', async () => {
      render(<EditProfile />);

      const ageInput = screen.getByPlaceholderText('年龄');
      fireEvent.change(ageInput, '25');

      expect(ageInput).toHaveValue('25');
    });

    it('年龄必须在18-60之间', async () => {
      render(<EditProfile />);

      const ageInput = screen.getByPlaceholderText('年龄');
      fireEvent.change(ageInput, '17');
      fireEvent.blur(ageInput);

      await waitFor(() => {
        expect(screen.getByText('年龄必须在18-60岁之间')).toBeInTheDocument();
      });
    });
  });

  describe('地区选择', () => {
    it('应该能够选择省份', async () => {
      render(<EditProfile />);

      const provinceSelect = screen.getByPlaceholderText('省份');
      fireEvent.click(provinceSelect);

      await waitFor(() => {
        expect(screen.getByText('北京')).toBeInTheDocument();
        expect(screen.getByText('上海')).toBeInTheDocument();
      });
    });

    it('选择省份后应该显示城市', async () => {
      render(<EditProfile />);

      const provinceSelect = screen.getByPlaceholderText('省份');
      fireEvent.click(provinceSelect);

      await waitFor(() => {
        expect(screen.getByText('城市')).toBeInTheDocument();
      });
    });

    it('应该能够选择完整地区', async () => {
      render(<EditProfile />);

      const provinceSelect = screen.getByPlaceholderText('省份');
      const citySelect = screen.getByPlaceholderText('城市');

      fireEvent.click(provinceSelect);
      fireEvent.click(screen.getByText('北京'));

      await waitFor(() => {
        fireEvent.click(citySelect);
        fireEvent.click(screen.getByText('朝阳区'));
      });

      expect(provinceSelect).toHaveValue('北京');
      expect(citySelect).toHaveValue('朝阳区');
    });
  });

  describe('相册管理', () => {
    it('应该显示相册列表', async () => {
      render(<EditProfile />);

      await waitFor(() => {
        expect(screen.getByText('我的相册')).toBeInTheDocument();
        expect(screen.getAllByAltText(/相册照片/).length).toBeGreaterThan(0);
      });
    });

    it('应该能够添加相册照片', async () => {
      render(<EditProfile />);

      const addButton = screen.getByText('添加照片');
      fireEvent.click(addButton);

      const fileInput = screen.getByLabelText('选择照片');
      const files = [
        new File([''], 'photo1.jpg', { type: 'image/jpeg' }),
        new File([''], 'photo2.jpg', { type: 'image/jpeg' })
      ];

      fireEvent.change(fileInput, { target: { files } });

      await waitFor(() => {
        expect(screen.getByText(/正在上传.*张照片/)).toBeInTheDocument();
      });
    });

    it('应该能够删除相册照片', async () => {
      render(<EditProfile />);

      const deleteButtons = screen.getAllByTitle('删除');

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('确定要删除这张照片吗?')).toBeInTheDocument();
        });
      }
    });

    it('应该能够设置封面照片', async () => {
      render(<EditProfile />);

      const coverButtons = screen.getAllByTitle('设为封面');

      if (coverButtons.length > 0) {
        fireEvent.click(coverButtons[0]);

        await waitFor(() => {
          const photos = screen.getAllByAltText(/相册照片/);
          expect(photos[0]).toHaveClass('cover-photo');
        });
      }
    });
  });

  describe('个性签名', () => {
    it('应该能够编辑个性签名', async () => {
      render(<EditProfile />);

      const signatureInput = screen.getByPlaceholderText('个性签名');
      fireEvent.change(signatureInput, '这是我的个性签名');

      expect(signatureInput).toHaveValue('这是我的个性签名');
    });

    it('个性签名不能超过100字', async () => {
      render(<EditProfile />);

      const signatureInput = screen.getByPlaceholderText('个性签名');
      const longSignature = 'a'.repeat(101);
      fireEvent.change(signatureInput, longSignature);
      fireEvent.blur(signatureInput);

      await waitFor(() => {
        expect(screen.getByText('个性签名不能超过100个字')).toBeInTheDocument();
      });
    });
  });

  describe('兴趣标签', () => {
    it('应该显示兴趣标签选择器', async () => {
      render(<EditProfile />);

      await waitFor(() => {
        expect(screen.getByText('兴趣标签')).toBeInTheDocument();
        expect(screen.getByText('运动')).toBeInTheDocument();
        expect(screen.getByText('音乐')).toBeInTheDocument();
        expect(screen.getByText('旅行')).toBeInTheDocument();
      });
    });

    it('应该能够选择多个兴趣标签', async () => {
      render(<EditProfile />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('运动'));
        fireEvent.click(screen.getByText('音乐'));
        fireEvent.click(screen.getByText('旅行'));
      });

      const selectedTags = screen.getAllByRole('checkbox', { checked: true });
      expect(selectedTags.length).toBe(3);
    });

    it('最多只能选择5个兴趣标签', async () => {
      render(<EditProfile />);

      await waitFor(() => {
        // 选择6个标签
        fireEvent.click(screen.getByText('运动'));
        fireEvent.click(screen.getByText('音乐'));
        fireEvent.click(screen.getByText('旅行'));
        fireEvent.click(screen.getByText('阅读'));
        fireEvent.click(screen.getByText('电影'));
        fireEvent.click(screen.getByText('美食'));

        // 应该只有5个被选中
        const selectedTags = screen.getAllByRole('checkbox', { checked: true });
        expect(selectedTags.length).toBe(5);
      });
    });
  });

  describe('保存功能', () => {
    it('修改信息后应该能够保存', async () => {
      const { updateProfile } = require('../../api/user');
      updateProfile.mockResolvedValue({ success: true });

      render(<EditProfile />);

      const nicknameInput = screen.getByPlaceholderText('昵称');
      const genderSelect = screen.getByText('性别');
      const ageInput = screen.getByPlaceholderText('年龄');
      const saveButton = screen.getByRole('button', { name: '保存' });

      fireEvent.change(nicknameInput, '新昵称');
      fireEvent.click(genderSelect);
      fireEvent.click(screen.getByText('男'));
      fireEvent.change(ageInput, '25');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith({
          nickname: '新昵称',
          gender: 'male',
          age: '25'
        });
        expect(screen.getByText('保存成功')).toBeInTheDocument();
      });
    });

    it('保存成功后应该跳转回个人中心', async () => {
      const { updateProfile } = require('../../api/user');
      updateProfile.mockResolvedValue({ success: true });

      render(<EditProfile />);

      const saveButton = screen.getByRole('button', { name: '保存' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
      });
    });

    it('保存失败时应该显示错误信息', async () => {
      const { updateProfile } = require('../../api/user');
      updateProfile.mockRejectedValue(new Error('Save failed'));

      render(<EditProfile />);

      const saveButton = screen.getByRole('button', { name: '保存' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('保存失败,请重试')).toBeInTheDocument();
      });
    });

    it('保存过程中应该显示加载状态', async () => {
      const { updateProfile } = require('../../api/user');
      let resolvePromise;
      updateProfile.mockImplementation(() => {
        return new Promise(resolve => {
          resolvePromise = resolve;
        });
      });

      render(<EditProfile />);

      const saveButton = screen.getByRole('button', { name: '保存' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/保存中.../)).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
      });

      resolvePromise({ success: true });
    });
  });

  describe('取消功能', () => {
    it('点击取消应该返回个人中心', async () => {
      render(<EditProfile />);

      const cancelButton = screen.getByRole('button', { name: '取消' });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('有未保存修改时应该提示确认', async () => {
      render(<EditProfile />);

      const nicknameInput = screen.getByPlaceholderText('昵称');
      fireEvent.change(nicknameInput, '修改后的昵称');

      const cancelButton = screen.getByRole('button', { name: '取消' });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('您有未保存的修改,确定要离开吗?')).toBeInTheDocument();
      });
    });
  });
});

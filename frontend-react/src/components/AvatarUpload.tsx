import React, { useState } from 'react';
import { Avatar, Box, Button, IconButton, CircularProgress } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar = '',
  onAvatarChange,
  size = 120
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_BASE_URL}/upload/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      onAvatarChange(response.data.data.avatar_url);
    } catch (err: any) {
      console.error('上传头像失败:', err);
      alert(err.response?.data?.message || '上传失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onAvatarChange('');
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="avatar-upload"
        onChange={handleUpload}
      />
      <label htmlFor="avatar-upload">
        <Avatar
          src={currentAvatar}
          sx={{
            width: size,
            height: size,
            cursor: 'pointer',
            border: '2px solid',
            borderColor: 'primary.main',
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          {!currentAvatar && <PhotoCameraIcon sx={{ fontSize: size / 2 }} />}
        </Avatar>
      </label>

      {currentAvatar && (
        <IconButton
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': { bgcolor: 'error.dark' }
          }}
          size="small"
          onClick={handleRemove}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      {uploading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.5)',
            borderRadius: '50%'
          }}
        >
          <CircularProgress size={24} sx={{ color: 'white' }} />
        </Box>
      )}
    </Box>
  );
};

export default AvatarUpload;

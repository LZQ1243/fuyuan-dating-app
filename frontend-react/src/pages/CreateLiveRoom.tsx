import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CreateLiveRoom: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'chat',
    tags: '',
    cover_image: '',
    is_private: false,
    password: '',
    max_viewers: 1000
  });

  const [streamKey, setStreamKey] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'chat', label: '聊天' },
    { value: 'game', label: '游戏' },
    { value: 'music', label: '音乐' },
    { value: 'other', label: '其他' }
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      setError('请输入直播间标题');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/live-rooms`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStreamKey(response.data.data.stream_key);
      setStreamUrl(response.data.data.stream_url);
    } catch (err: any) {
      setError(err.response?.data?.message || '创建失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLive = async () => {
    if (!streamKey) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/live-rooms/${formData.title}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/live-list');
    } catch (err: any) {
      setError(err.response?.data?.message || '启动失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('cover', file);

      const response = await axios.post(`${API_BASE_URL}/live-rooms/upload/cover`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      handleChange('cover_image', response.data.data.cover_url);
    } catch (err: any) {
      setError(err.response?.data?.message || '上传失败');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        创建直播间
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TextField
            fullWidth
            label="直播间标题"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>分类</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              label="分类"
            >
              {categories.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="标签（用逗号分隔）"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="例如：聊天,交友,音乐"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              上传封面图
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleCoverUpload}
              />
            </Button>
            {formData.cover_image && (
              <Typography variant="caption" color="success" sx={{ mt: 1, display: 'block' }}>
                ✓ 封面已上传
              </Typography>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_private}
                onChange={(e) => handleChange('is_private', e.target.checked)}
              />
            }
            label="设为私密直播间"
            sx={{ mb: 2, display: 'block' }}
          />

          {formData.is_private && (
            <TextField
              fullWidth
              label="直播间密码"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              sx={{ mb: 2 }}
              required={formData.is_private}
            />
          )}

          <TextField
            fullWidth
            label="最大观众数"
            type="number"
            value={formData.max_viewers}
            onChange={(e) => handleChange('max_viewers', parseInt(e.target.value))}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleCreate}
            disabled={loading || !!streamKey}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : '创建直播间'}
          </Button>

          {streamKey && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                ✅ 直播间创建成功！
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  推流地址：
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={streamUrl}
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  推流密钥：
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={streamKey}
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{ bgcolor: 'background.paper' }}
                />
                <Typography variant="caption" color="warning" sx={{ mt: 0.5, display: 'block' }}>
                  ⚠️ 请妥善保管推流密钥，不要泄露给他人
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  1. 打开OBS或其他推流软件<br/>
                  2. 将推流地址和密钥填入设置<br/>
                  3. 点击"开始推流"按钮<br/>
                  4. 点击下方按钮正式开始直播
                </Typography>
              </Alert>

              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleStartLive}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : '开始直播'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateLiveRoom;

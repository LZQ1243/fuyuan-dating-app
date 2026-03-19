import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, Typography, Box, TextField, Button, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Person as PersonIcon, Star as StarIcon, StarBorder as StarBorderIcon, Close as CloseIcon, Label as LabelIcon, Delete as DeleteIcon } from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface FavoriteUser {
  _id: string;
  favorite_user_id: string;
  nickname: string;
  avatar: string;
  gender: string;
  online_status: boolean;
}

const Favorites: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<FavoriteUser | null>(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', page],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/match/favorites?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ userId, userNote, userTags }: { userId: string, userNote: string, userTags: string[] }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/match/favorite`, {
        favorite_user_id: userId,
        note: userNote,
        tags: userTags
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      handleDialogClose();
    }
  });

  const unfavoriteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/match/favorite/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      handleDialogClose();
    }
  });

  const handleDialogOpen = (user: FavoriteUser) => {
    setSelectedUser(user);
    setNote(user.note || '');
    setTags(user.tags || []);
  };

  const handleDialogClose = () => {
    setSelectedUser(null);
    setNote('');
    setTags([]);
    setInputTag('');
  };

  const handleAddTag = () => {
    if (inputTag.trim() && !tags.includes(inputTag.trim())) {
      setTags([...tags, inputTag.trim()]);
      setInputTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (selectedUser) {
      favoriteMutation.mutate({
        userId: selectedUser.favorite_user_id,
        userNote: note,
        userTags: tags
      });
    }
  };

  const handleRemove = (userId: string) => {
    if (window.confirm('确定要移除收藏吗？')) {
      unfavoriteMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        我的收藏
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {data?.favorites?.map((user: FavoriteUser) => (
          <Card key={user._id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={user.avatar}
                  alt={user.nickname}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {user.nickname}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={user.gender === '男' ? '男' : '女'}
                      size="small"
                      color={user.gender === '男' ? 'primary' : 'secondary'}
                    />
                    {user.online_status && (
                      <Chip
                        label="在线"
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleDialogOpen(user)}
                  sx={{ ml: 'auto' }}
                >
                  <StarIcon fontSize="small" />
                </Button>
              </Box>
              <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleDialogOpen(user)}
                  startIcon={<StarIcon />}
                >
                  管理
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemove(user.favorite_user_id)}
                  startIcon={<DeleteIcon />}
                >
                  移除
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page >= data.pagination.totalPages}
            variant="outlined"
          >
            下一页
          </Button>
        </Box>
      )}

      <Dialog open={!!selectedUser} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>管理收藏</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={selectedUser.avatar}
                  alt={selectedUser.nickname}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Typography variant="h6">
                  {selectedUser.nickname}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="收藏备注"
                multiline
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加一些备注..."
                sx={{ mt: 2 }}
              />

              <Box>
                <Typography variant="body2" gutterBottom>
                  标签
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      deleteIcon={<CloseIcon />}
                      size="small"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="输入标签后按回车添加"
                    fullWidth
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleAddTag}
                    startIcon={<LabelIcon />}
                  >
                    添加
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            取消
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Favorites;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface LiveRoom {
  _id: string;
  host_id: {
    _id: string;
    username: string;
    avatar: string;
  };
  title: string;
  cover_image: string;
  category: string;
  tags: string[];
  viewer_count: number;
  like_count: number;
  status: string;
  created_at: string;
}

const LiveList: React.FC = () => {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'chat', label: '聊天' },
    { value: 'game', label: '游戏' },
    { value: 'music', label: '音乐' },
    { value: 'other', label: '其他' }
  ];

  // 获取直播列表
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/live-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { category, status: 'live' }
      });
      setRooms(response.data.data.rooms);
    } catch (err: any) {
      console.error('获取直播列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [category]);

  // 定时刷新直播列表
  useEffect(() => {
    const interval = setInterval(fetchRooms, 30000); // 30秒刷新一次
    return () => clearInterval(interval);
  }, [category]);

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.host_id.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        直播广场
      </Typography>

      {/* 搜索和筛选 */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="搜索直播间或主播..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        <Box display="flex" gap={1} flexWrap="wrap">
          {categories.map((cat) => (
            <Chip
              key={cat.value}
              label={cat.label}
              onClick={() => setCategory(cat.value)}
              color={category === cat.value ? 'primary' : 'default'}
              variant={category === cat.value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* 直播列表 */}
      {filteredRooms.length === 0 ? (
        <Box textAlign="center" sx={{ mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            暂无直播
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {category === 'all' ? '快去创建你的第一个直播间吧！' : '该分类下暂无直播'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => window.location.href = `/live-rooms/${room._id}`}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={room.cover_image || '/default-cover.jpg'}
                    alt={room.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="caption">
                      🔴 直播中
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption">
                      {room.viewer_count}
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap gutterBottom>
                    {room.title}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                      src={room.host_id.avatar}
                      alt={room.host_id.username}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {room.host_id.username}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip
                      label={categories.find(c => c.value === room.category)?.label || '其他'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {room.tags && room.tags.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {room.tags.slice(0, 2).map((tag, index) => (
                        <Chip
                          key={index}
                          label={`#${tag}`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5, height: 20 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton size="small" disabled>
                      <FavoriteIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      {room.like_count}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/live-rooms/${room._id}`;
                    }}
                  >
                    进入直播间
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LiveList;

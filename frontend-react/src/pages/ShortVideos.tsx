import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  Fab
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Package {
  _id: string;
  name: string;
  description: string;
  video_limit: number;
  validity_days: number;
  price: number;
}

interface UserPackage {
  has_package: boolean;
  remaining_videos?: number;
  end_time?: string;
}

interface Video {
  _id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  title: string;
  video_url: string;
  cover_image?: string;
  duration: number;
  views: number;
  likes_count: number;
  comments_count: number;
  tags: string[];
  created_at: string;
}

const ShortVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [packagesDialog, setPackagesDialog] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    tags: '',
    is_private: false
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  // 获取推荐视频
  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/short-videos/recommended`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(response.data.data.videos);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取视频失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取套餐列表
  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/short-videos/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取套餐失败');
    }
  };

  // 检查用户套餐
  const checkUserPackage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/short-videos/package/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPackage(response.data.data);
    } catch (err: any) {
      console.error('检查套餐失败:', err);
    }
  };

  // 购买套餐
  const handleBuyPackage = async (packageId: string) => {
    if (!window.confirm('确定要购买这个套餐吗？')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/short-videos/packages/buy`, {
        package_id: packageId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('购买成功！');
      setPackagesDialog(false);
      checkUserPackage();
    } catch (err: any) {
      setError(err.response?.data?.message || '购买失败');
    }
  };

  // 上传视频
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // 检查用户套餐
    if (!userPackage?.has_package || (userPackage.remaining_videos || 0) <= 0) {
      alert('请先购买套餐');
      setPackagesDialog(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', uploadData.title || '未命名视频');
      if (uploadData.tags) {
        formData.append('tags', uploadData.tags);
      }
      formData.append('is_private', uploadData.is_private.toString());

      await axios.post(`${API_BASE_URL}/short-videos/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('上传成功，等待审核！');
      setUploadDialog(false);
      setUploadData({ title: '', tags: '', is_private: false });
      checkUserPackage();
      fetchVideos();
    } catch (err: any) {
      setError(err.response?.data?.message || '上传失败');
    }
  };

  // 删除视频
  const handleDelete = async (videoId: string) => {
    if (!window.confirm('确定要删除这个视频吗？')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/short-videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVideos();
    } catch (err: any) {
      setError(err.response?.data?.message || '删除失败');
    }
  };

  // 播放/暂停视频
  const togglePlay = (video: Video) => {
    if (currentVideo?._id === video._id && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentVideo(video);
      setIsPlaying(true);
      // 记录观看
      axios.post(
        `${API_BASE_URL}/short-videos/${video._id}/watch`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      ).catch(console.error);
    }
  };

  // 视频加载完成后播放
  useEffect(() => {
    if (videoRef.current && currentVideo && isPlaying) {
      videoRef.current.play();
    }
  }, [currentVideo, isPlaying]);

  useEffect(() => {
    fetchVideos();
    checkUserPackage();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 20 }}>
      <Typography variant="h4" gutterBottom>
        短视频
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 用户套餐信息 */}
      {userPackage && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2">
            {userPackage.has_package
              ? `剩余上传次数: ${userPackage.remaining_videos}`
              : '暂无套餐'}
          </Typography>
          {userPackage.end_time && (
            <Typography variant="caption" color="text.secondary">
              有效期至: {new Date(userPackage.end_time).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      )}

      {/* 视频列表 */}
      {videos.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          暂无视频，快来上传第一个吧！
        </Typography>
      ) : (
        videos.map((video) => (
          <Card key={video._id} sx={{ mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              {currentVideo?._id === video._id ? (
                <video
                  ref={videoRef}
                  src={`${API_BASE_URL}${video.video_url}`}
                  style={{ width: '100%', maxHeight: '70vh' }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <CardMedia
                  component="img"
                  image={video.cover_image || `${API_BASE_URL}${video.video_url}`}
                  alt={video.title}
                  sx={{
                    height: '70vh',
                    objectFit: 'cover'
                  }}
                />
              )}
              <IconButton
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  width: 64,
                  height: 64
                }}
                onClick={() => togglePlay(video)}
              >
                {currentVideo?._id === video._id && isPlaying ? (
                  <PauseIcon sx={{ fontSize: 40 }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: 40 }} />
                )}
              </IconButton>
            </Box>

            <CardContent>
              <Typography variant="h6" gutterBottom>
                {video.title}
              </Typography>

              <Box display="flex" alignItems="center" mb={1}>
                <Avatar
                  src={video.user.avatar}
                  alt={video.user.username}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {video.user.username}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="body2" color="text.secondary">
                  ▶️ {video.views}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ❤️ {video.likes_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  💬 {video.comments_count}
                </Typography>
              </Box>

              {video.tags && video.tags.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {video.tags.map((tag, index) => (
                    <Chip key={index} label={`#${tag}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
              )}
            </CardContent>

            <Box display="flex" justifyContent="space-around">
              <IconButton>
                <FavoriteBorderIcon />
              </IconButton>
              <IconButton>
                <CommentIcon />
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(video._id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        ))
      )}

      {/* 浮动上传按钮 */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24
        }}
        onClick={() => setUploadDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* 上传视频对话框 */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>上传短视频</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="标题"
            fullWidth
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="标签（用逗号分隔）"
            fullWidth
            value={uploadData.tags}
            onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
            sx={{ mt: 2 }}
          />
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            style={{ marginTop: '16px', width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackagesDialog(true)}>购买套餐</Button>
          <Button onClick={() => setUploadDialog(false)}>取消</Button>
        </DialogActions>
      </Dialog>

      {/* 套餐购买对话框 */}
      <Dialog open={packagesDialog} onClose={() => setPackagesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>选择套餐</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {packages.map((pkg) => (
              <Grid item xs={12} key={pkg._id}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => handleBuyPackage(pkg._id)}
                >
                  <Typography variant="h6">{pkg.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pkg.description}
                  </Typography>
                  <Typography variant="body2">
                    可上传 {pkg.video_limit} 个视频，有效期 {pkg.validity_days} 天
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ¥{pkg.price}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackagesDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShortVideos;

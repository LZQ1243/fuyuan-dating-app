import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Send as SendIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Moment {
  _id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  images: string[];
  video_url?: string;
  location?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

interface Comment {
  _id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  created_at: string;
}

const Moments: React.FC = () => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishDialog, setPublishDialog] = useState(false);
  const [newMoment, setNewMoment] = useState({
    content: '',
    images: [] as File[],
    location: '',
    visibility: 'public'
  });
  const [commentDialog, setCommentDialog] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // 获取朋友圈列表
  const fetchMoments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/moments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMoments(response.data.data.moments);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取朋友圈失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取评论列表
  const fetchComments = async (momentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/moments/${momentId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data.data.comments);
    } catch (err: any) {
      console.error('获取评论失败:', err);
    }
  };

  // 发布朋友圈
  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      let imageData: string[] = [];

      // 如果有图片，先上传
      if (newMoment.images.length > 0) {
        const formData = new FormData();
        newMoment.images.forEach((image) => {
          formData.append('images', image);
        });

        const uploadResponse = await axios.post(`${API_BASE_URL}/moments/upload/image`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        imageData = uploadResponse.data.data.image_url
          ? [uploadResponse.data.data.image_url]
          : [];
      }

      await axios.post(`${API_BASE_URL}/moments`, {
        content: newMoment.content,
        images: imageData,
        location: newMoment.location,
        visibility: newMoment.visibility
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPublishDialog(false);
      setNewMoment({ content: '', images: [], location: '', visibility: 'public' });
      fetchMoments();
    } catch (err: any) {
      setError(err.response?.data?.message || '发布失败');
    }
  };

  // 点赞/取消点赞
  const handleLike = async (momentId: string, isLiked: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (isLiked) {
        await axios.delete(`${API_BASE_URL}/moments/${momentId}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/moments/${momentId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchMoments();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败');
    }
  };

  // 删除朋友圈
  const handleDelete = async (momentId: string) => {
    if (!window.confirm('确定要删除这条朋友圈吗？')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/moments/${momentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMoments();
    } catch (err: any) {
      setError(err.response?.data?.message || '删除失败');
    }
  };

  // 发表评论
  const handleComment = async () => {
    if (!newComment.trim() || !selectedMoment) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/moments/${selectedMoment._id}/comments`, {
        content: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewComment('');
      fetchComments(selectedMoment._id);
      fetchMoments();
    } catch (err: any) {
      setError(err.response?.data?.message || '评论失败');
    }
  };

  // 打开评论对话框
  const openCommentDialog = (moment: Moment) => {
    setSelectedMoment(moment);
    setCommentDialog(true);
    fetchComments(moment._id);
  };

  useEffect(() => {
    fetchMoments();
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        朋友圈
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 发布按钮 */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => setPublishDialog(true)}
          sx={{ py: 2 }}
        >
          发布朋友圈
        </Button>
      </Box>

      {/* 朋友圈列表 */}
      {moments.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          暂无朋友圈内容，快来发布第一条吧！
        </Typography>
      ) : (
        moments.map((moment) => (
          <Card key={moment._id} sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="flex-start" mb={2}>
                <Avatar
                  src={moment.user.avatar}
                  alt={moment.user.username}
                  sx={{ mr: 2 }}
                />
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {moment.user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(moment.created_at).toLocaleString()}
                  </Typography>
                  {moment.location && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      📍 {moment.location}
                    </Typography>
                  )}
                </Box>
              </Box>

              {moment.content && (
                <Typography variant="body1" paragraph>
                  {moment.content}
                </Typography>
              )}

              {moment.images && moment.images.length > 0 && (
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {moment.images.map((image, index) => (
                    <Grid item xs={moment.images!.length === 1 ? 12 : 6} key={index}>
                      <CardMedia
                        component="img"
                        image={`${API_BASE_URL}${image}`}
                        alt={`Moment ${index + 1}`}
                        sx={{
                          borderRadius: 1,
                          height: moment.images!.length === 1 ? 'auto' : 200,
                          objectFit: 'cover'
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {moment.video_url && (
                <CardMedia
                  component="video"
                  src={`${API_BASE_URL}${moment.video_url}`}
                  controls
                  sx={{ borderRadius: 1, mb: 2 }}
                />
              )}
            </CardContent>

            <CardActions disableSpacing>
              <IconButton
                onClick={() => handleLike(moment._id, moment.is_liked)}
                color={moment.is_liked ? 'error' : 'default'}
              >
                {moment.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {moment.likes_count}
              </Typography>

              <IconButton onClick={() => openCommentDialog(moment)}>
                <CommentIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {moment.comments_count}
              </Typography>

              <IconButton>
                <ShareIcon />
              </IconButton>

              <Box sx={{ ml: 'auto' }}>
                <IconButton onClick={() => handleDelete(moment._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardActions>
          </Card>
        ))
      )}

      {/* 发布朋友圈对话框 */}
      <Dialog open={publishDialog} onClose={() => setPublishDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>发布朋友圈</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="内容"
            fullWidth
            multiline
            rows={4}
            value={newMoment.content}
            onChange={(e) => setNewMoment({ ...newMoment, content: e.target.value })}
            placeholder="分享你的想法..."
          />
          <TextField
            margin="dense"
            label="位置"
            fullWidth
            value={newMoment.location}
            onChange={(e) => setNewMoment({ ...newMoment, location: e.target.value })}
            placeholder="在哪里？"
            sx={{ mt: 2 }}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setNewMoment({ ...newMoment, images: Array.from(e.target.files) });
              }
            }}
            style={{ marginTop: '16px' }}
          />
          {newMoment.images.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              已选择 {newMoment.images.length} 张图片
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialog(false)}>取消</Button>
          <Button onClick={handlePublish} variant="contained">发布</Button>
        </DialogActions>
      </Dialog>

      {/* 评论对话框 */}
      <Dialog open={commentDialog} onClose={() => setCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>评论 ({selectedMoment?.comments_count})</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                还没有评论，快来抢沙发吧！
              </Typography>
            ) : (
              comments.map((comment) => (
                <Box key={comment._id} sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                      src={comment.user.avatar}
                      alt={comment.user.username}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Typography variant="subtitle2">{comment.user.username}</Typography>
                  </Box>
                  <Typography variant="body2">{comment.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="写评论..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleComment}>
                  <SendIcon />
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Moments;

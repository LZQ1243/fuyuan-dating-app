import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  Avatar,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Favorite as FavoriteIcon,
  Gift as GiftIcon,
  Close as CloseIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import io, { Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Comment {
  _id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  type: string;
  created_at: string;
}

interface LiveRoom {
  _id: string;
  host_id: {
    _id: string;
    username: string;
    avatar: string;
    age?: number;
    gender?: string;
    bio?: string;
  };
  title: string;
  cover_image: string;
  stream_url: string;
  category: string;
  tags: string[];
  viewer_count: number;
  like_count: number;
  status: string;
}

const LiveRoomPage: React.FC = () => {
  const { room_id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // 获取直播间详情
  const fetchRoomDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/live-rooms/${room_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(response.data.data);
      setOnlineCount(response.data.data.current_viewers || 0);
      setComments(response.data.data.recent_comments || []);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.need_password) {
        const password = prompt('请输入直播间密码:');
        if (password) {
          fetchRoomDetailWithPassword(password);
        } else {
          navigate('/live-list');
        }
      } else {
        setError(err.response?.data?.message || '获取直播间信息失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomDetailWithPassword = async (password: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/live-rooms/${room_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { password }
      });
      setRoom(response.data.data);
      setOnlineCount(response.data.data.current_viewers || 0);
      setComments(response.data.data.recent_comments || []);
    } catch (err: any) {
      setError(err.response?.data?.message || '密码错误');
    } finally {
      setLoading(false);
    }
  };

  // 加入直播间
  const joinRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/live-rooms/${room_id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('加入直播间失败:', err);
    }
  };

  // 发送评论
  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/live-rooms/${room_id}/comments`, {
        content: newComment.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
    } catch (err) {
      console.error('发送评论失败:', err);
    }
  };

  // 点赞
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/live-rooms/${room_id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (room) {
        setRoom({ ...room, like_count: room.like_count + 1 });
      }
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  // 离开直播间
  const leaveRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/live-rooms/${room_id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('离开直播间失败:', err);
    }
  };

  // 初始化Socket连接
  useEffect(() => {
    const newSocket = io(`${API_BASE_URL.replace('/api', '')}`, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join:room', room_id);
    });

    newSocket.on('room:viewer:count', (count) => {
      setOnlineCount(count);
    });

    newSocket.on('room:comment:new', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    newSocket.on('room:like:new', () => {
      if (room) {
        setRoom(prev => prev ? { ...prev, like_count: prev.like_count + 1 } : null);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [room_id]);

  useEffect(() => {
    fetchRoomDetail();
    joinRoom();

    return () => {
      leaveRoom();
    };
  }, [room_id]);

  // 滚动到最新评论
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !room) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" onClose={() => navigate('/live-list')}>
          {error || '直播间不存在'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2, px: 0 }}>
      {/* 视频播放区 */}
      <Box sx={{ position: 'relative', bgcolor: 'black', height: 'calc(100vh - 100px)' }}>
        {/* HLS播放器 */}
        <video
          autoPlay
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        >
          <source src={`${API_BASE_URL.replace('/api', '')}${room.stream_url}`} type="application/x-mpegURL" />
          您的浏览器不支持视频播放
        </video>

        {/* 直播信息覆盖层 */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'white',
            textShadow: '0 0 3px rgba(0,0,0,0.8)'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {room.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={room.host_id.avatar} sx={{ width: 32, height: 32 }} />
            <Typography variant="body2">
              {room.host_id.username}
            </Typography>
            <Chip label={`${onlineCount}人在线`} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }} />
          </Box>
        </Box>

        {/* 顶部操作按钮 */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16
          }}
        >
          <Button
            startIcon={<CloseIcon />}
            onClick={() => navigate('/live-list')}
            sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            退出
          </Button>
        </Box>

        {/* 聊天区域 */}
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            width: 360,
            maxHeight: '70%',
            bgcolor: 'rgba(0,0,0,0.7)',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 评论列表 */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 3 }
            }}
          >
            {comments.map((comment) => (
              <Box key={comment._id} sx={{ mb: 1 }}>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Avatar
                    src={comment.user.avatar}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    {comment.user.username}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'white', wordBreak: 'break-word' }}>
                  {comment.content}
                </Typography>
              </Box>
            ))}
            <div ref={commentsEndRef} />
          </Box>

          <Divider />

          {/* 发送评论 */}
          <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="发送消息..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendComment();
                }
              }}
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                }
              }}
            />
            <IconButton onClick={handleSendComment} sx={{ color: 'white' }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 左侧互动按钮 */}
        <Box
          sx={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Fab
            color="primary"
            size="medium"
            onClick={handleLike}
            sx={{ bgcolor: 'rgba(255,0,0,0.8)', '&:hover': { bgcolor: 'rgba(255,0,0,1)' } }}
          >
            <FavoriteIcon />
          </Fab>
          <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
            {room.like_count}
          </Typography>
          <Fab
            color="secondary"
            size="medium"
            sx={{ bgcolor: 'rgba(255,215,0,0.8)', '&:hover': { bgcolor: 'rgba(255,215,0,1)' } }}
          >
            <GiftIcon />
          </Fab>
          <Fab
            size="medium"
            sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <ShareIcon />
          </Fab>
        </Box>
      </Box>
    </Container>
  );
};

export default LiveRoomPage;

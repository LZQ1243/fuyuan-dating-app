import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, Typography, Box, Chip, Timeline, TimelineItem, TimelineContent, TimelineDot } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface MatchHistory {
  _id: string;
  target_user_id: string;
  match_score: number;
  match_reason: string;
  action: string;
  created_at: string;
}

interface FavoriteUser {
  _id: string;
  nickname: string;
  avatar: string;
  gender: string;
}

const MatchHistory: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'view' | 'like' | 'dislike' | 'chat'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['matchHistory', page, filter],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/match/history?page=${page}&limit=20${filter !== 'all' ? `&action=${filter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    }
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'like': return 'success';
      case 'dislike': return 'error';
      case 'view': return 'info';
      case 'chat': return 'warning';
      case 'skip': return 'default';
      default: return 'default';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'like': return '喜欢';
      case 'dislike': return '不喜欢';
      case 'view': return '查看';
      case 'chat': return '聊天';
      case 'skip': return '跳过';
      default: return '未知';
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
        匹配历史
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Chip
          label="全部"
          onClick={() => setFilter('all')}
          color={filter === 'all' ? 'primary' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip
          label="查看"
          onClick={() => setFilter('view')}
          color={filter === 'view' ? 'primary' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip
          label="喜欢"
          onClick={() => setFilter('like')}
          color={filter === 'like' ? 'primary' : 'default'}
          sx={{ mr: 1 }}
        />
        <Chip
          label="不喜欢"
          onClick={() => setFilter('dislike')}
          color={filter === 'dislike' ? 'primary' : 'default'}
        />
        <Chip
          label="聊天"
          onClick={() => setFilter('chat')}
          color={filter === 'chat' ? 'primary' : 'default'}
        />
      </Box>

      {data?.history?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            暂无匹配历史记录
          </Typography>
        </Box>
      ) : (
        <Timeline>
          {data.history?.map((item: MatchHistory) => (
            <TimelineItem key={item._id}>
              <TimelineSeparator />
              <TimelineDot color={getActionColor(item.action)} />
              <TimelineContent>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.created_at).toLocaleString('zh-CN')}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getActionLabel(item.action)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    匹配得分: {item.match_score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.match_reason || '无匹配原因'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="body2">
                      {item.target_user_id}
                    </Typography>
                  </Box>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}

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
    </Box>
  );
};

export default MatchHistory;

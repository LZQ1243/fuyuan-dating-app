import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, List, Avatar, Image, Spin, message, Space, Divider } from 'antd';
import { LikeOutlined, CommentOutlined, ShareAltOutlined, ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/auth';

const { TextArea } = Input;

interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
}

function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // 加载帖子详情
  const loadPostDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('加载失败');
      }
      
      const data = await response.json();
      setPost(data.data);
    } catch (error) {
      message.error('加载帖子详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 点赞
  const handleLike = async () => {
    if (!post) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setPost({
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        });
      }
    } catch (error) {
      message.error('点赞失败');
      console.error(error);
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    
    try {
      setSubmittingComment(true);
      const response = await fetch(`http://localhost:3000/api/posts/${post?._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPost(prev => prev ? {
          ...prev,
          comments: [...prev.comments, data.data],
        } : null);
        setCommentText('');
        message.success('评论成功');
      }
    } catch (error) {
      message.error('评论失败');
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // 分享
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.content,
        url: window.location.href,
      });
    } else {
      message.info('分享功能开发中');
    }
  };

  useEffect(() => {
    loadPostDetail();
  }, [id, token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>帖子不存在或已被删除</p>
        <Button type="primary" onClick={() => navigate('/posts')}>
          返回动态
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Space style={{ marginBottom: 20 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/posts')}
        >
          返回
        </Button>
      </Space>

      {/* 帖子内容 */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Avatar 
            size={48} 
            src={post.user.avatar} 
            style={{ marginRight: 12 }}
          />
          <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
            <div style={{ fontSize: 16, fontWeight: 'bold' }}>
              {post.user.username}
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 16, lineHeight: 1.8 }}>
          {post.content}
        </p>

        {/* 图片展示 */}
        {post.images && post.images.length > 0 && (
          <Image.PreviewGroup>
            <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt="post-image"
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        )}

        <Divider />

        {/* 互动按钮 */}
        <Space size="large">
          <Button 
            type={post.isLiked ? 'primary' : 'default'}
            icon={<LikeOutlined />}
            onClick={handleLike}
          >
            {post.likes} 点赞
          </Button>
          <Button icon={<CommentOutlined />}>
            {post.comments.length} 评论
          </Button>
          <Button icon={<ShareAltOutlined />} onClick={handleShare}>
            分享
          </Button>
        </Space>
      </Card>

      {/* 评论区 */}
      <Card title={`评论 (${post.comments.length})`} style={{ marginTop: 20 }}>
        {/* 发表评论 */}
        <div style={{ marginBottom: 20 }}>
          <TextArea
            rows={3}
            placeholder="写下你的评论..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <div style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSubmitComment}
              loading={submittingComment}
            >
              发送评论
            </Button>
          </div>
        </div>

        {/* 评论列表 */}
        {post.comments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            还没有评论，快来抢沙发吧！
          </p>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={post.comments}
            renderItem={(comment) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={comment.user.avatar} />}
                  title={
                    <div>
                      <span style={{ fontWeight: 'bold' }}>
                        {comment.user.username}
                      </span>
                      <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  }
                  description={comment.content}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default PostDetail;

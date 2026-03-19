import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Card, Row, Col, Button, List, Avatar, Image, Spin, Empty, message } from 'antd';
import { HeartOutlined, MessageOutlined, ShareAltOutlined } from '@ant-design/icons';

interface Post {
  post_id: string;
  user: {
    user_id: string;
    nickname: string;
    avatar: string;
  };
  content: string;
  media_urls: string[];
  type: string;
  likes_count: number;
  is_liked: boolean;
  comments_count: number;
  created_at: string;
}

function Posts() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (append = false) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const currentPage = append ? page + 1 : 1;
      const response = await fetch(`http://localhost:3000/api/posts?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.code === 200) {
        if (append) {
          setPosts(prev => [...prev, ...data.data.posts]);
        } else {
          setPosts(data.data.posts);
        }

        setPage(data.data.pagination.page);
        setHasMore(data.data.pagination.page < data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('获取动态列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.code === 200) {
        setPosts(prev => prev.map(post =>
          post.post_id === postId
            ? { ...post, is_liked: !isLiked, likes_count: post.likes_count + (isLiked ? -1 : 1) }
            : post
        ));

        message.success(isLiked ? '已取消点赞' : '点赞成功');
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const goToCreate = () => {
    navigate('/posts/create');
  };

  const viewPostDetail = (postId: string) => {
    navigate(`/posts/${postId}`);
  };

  const loadMore = () => {
    if (hasMore) {
      loadPosts(true);
    }
  };

  useEffect(() => {
    if (token) {
      loadPosts();
    }
  }, [token]);

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ color: '#333' }}>动态</h1>
          <Button type="primary" onClick={goToCreate}>发布动态</Button>
        </div>

        <Spin spinning={loading && posts.length === 0}>
          {posts.length === 0 && !loading ? (
            <Empty
              description="暂无动态，快来发布第一条吧"
              style={{ marginTop: '100px' }}
            />
          ) : (
            <Row gutter={[16]}>
              {posts.map((post: Post) => (
                <Col xs={24} sm={12} key={post.post_id}>
                  <Card
                    hoverable
                    onClick={() => viewPostDetail(post.post_id)}
                    style={{ borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      avatar={post.user?.avatar || '/default-avatar.png'}
                      title={<span style={{ fontSize: '16px' }}>{post.user?.nickname || '匿名'}</span>}
                      description={post.created_at}
                    />

                    <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '12px', color: '#333' }}>
                        {post.content}
                      </p>

                      {post.media_urls && post.media_urls.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                          {post.media_urls.slice(0, 9).map((url, index) => (
                            <Image
                              key={index}
                              src={url}
                              alt=""
                              style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                borderRadius: '8px',
                                objectFit: 'cover'
                              }}
                              preview={{
                                src: post.media_urls
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        paddingTop: '12px',
                        borderTop: '1px solid #f0f0f0'
                      }}>
                        <div
                          onClick={() => handleLike(post.post_id, post.is_liked)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            color: post.is_liked ? '#FF6B6B' : '#999'
                          }}
                        >
                          <HeartOutlined style={{ fontSize: '20px' }} />
                          <span style={{ fontSize: '14px' }}>
                            {post.likes_count}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MessageOutlined style={{ fontSize: '20px', color: '#999' }} />
                          <span style={{ fontSize: '14px', color: '#999' }}>
                            {post.comments_count}
                          </span>
                        </div>

                        <ShareAltOutlined style={{ fontSize: '20px', color: '#999' }} />
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Button onClick={loadMore} loading={loading}>
              加载更多
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Posts;

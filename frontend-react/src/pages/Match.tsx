import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Card, Row, Col, Tag, Button, Spin, Empty } from 'antd';

interface User {
  user_id: string;
  nickname: string;
  gender: number;
  age: number;
  avatar: string;
  disability_type: string;
  disability_level: number;
  location: {
    city: string;
    district: string;
  };
  online_status: boolean;
  match_score: number;
  match_reason: string;
}

function Match() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadUsers = async (append = false) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/match/recommend?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.code === 200) {
        if (append) {
          setUsers(prev => [...prev, ...data.data.users]);
        } else {
          setUsers(data.data.users);
        }

        setPage(data.data.pagination.page);
        setHasMore(data.data.pagination.page < data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('获取推荐用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) {
      loadUsers(true);
    }
  };

  const startChat = (userId: string) => {
    console.log('开始聊天:', userId);
  };

  const viewProfile = (userId: string) => {
    console.log('查看用户:', userId);
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>智能匹配</h1>

        <Spin spinning={loading && users.length === 0}>
          <Row gutter={[16]}>
            {users.length === 0 && !loading ? (
              <Col span={24}>
                <Empty description="暂无推荐用户" />
              </Col>
            ) : (
              users.map((user: User) => (
                <Col xs={24} sm={12} md={8} lg={6} key={user.user_id}>
                  <Card
                    hoverable
                    onClick={() => viewProfile(user.user_id)}
                    style={{ borderRadius: '10px', overflow: 'hidden' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt=""
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                      {user.online_status && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#52c41a',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '12px'
                        }}>
                          在线
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                          {user.nickname || '匿名'}
                        </span>
                        <span style={{ fontSize: '24px', color: '#FF6B6B', fontWeight: 'bold' }}>
                          {user.match_score}%
                        </span>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <Tag color="blue">{user.gender === 1 ? '男' : '女'}</Tag>
                        <Tag color="green">{user.age}岁</Tag>
                        <Tag color="orange">{user.disability_type}</Tag>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        color: '#666',
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}>
                        <span>📍 {user.location?.city || '未知'}</span>
                      </div>

                      <div style={{
                        background: '#f0f0f0',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '16px'
                      }}>
                        {user.match_reason}
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => startChat(user.user_id)}
                        style={{ marginBottom: '12px' }}
                      >
                        发消息
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Button onClick={loadMore} loading={loading}>
                加载更多
              </Button>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}

export default Match;

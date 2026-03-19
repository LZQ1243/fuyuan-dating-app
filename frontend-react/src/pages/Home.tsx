import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Layout } from '../components/Layout';

function Home() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [recommendUsers, setRecommendUsers] = useState([]);

  useEffect(() => {
    if (token) {
      // 获取推荐用户
      fetchRecommendUsers();
    }
  }, [token]);

  const fetchRecommendUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/match/recommend', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setRecommendUsers(data.data.users.slice(0, 6));
      }
    } catch (error) {
      console.error('获取推荐用户失败:', error);
    }
  };

  const goToMatch = () => navigate('/match');
  const goToPosts = () => navigate('/posts');
  const goToChat = () => navigate('/chat');

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <h1>欢迎，{user?.nickname || '用户'}</h1>
        <p style={{ color: '#666' }}>遇见你的缘分</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginTop: '40px',
          marginBottom: '40px'
        }}>
          <div onClick={goToMatch} style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💕</div>
            <div>智能匹配</div>
          </div>
          <div onClick={goToPosts} style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
            <div>发布动态</div>
          </div>
          <div onClick={goToChat} style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
            <div>开始聊天</div>
          </div>
          <div onClick={() => navigate('/profile')} style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
            <div>个人资料</div>
          </div>
        </div>

        <h2 style={{ marginBottom: '20px' }}>为你推荐</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          {recommendUsers.map(user => (
            <div key={user.user_id} style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#f0f0f0',
                margin: '0 auto 15px'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <div style={{ fontSize: '30px' }}>👤</div>
                )}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                {user.nickname || '匿名'}
              </div>
              <div style={{ fontSize: '14px', color: '#FF6B6B', marginBottom: '10px' }}>
                匹配度 {user.match_score}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Home;

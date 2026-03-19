import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Layout as AntLayout, Menu, Button } from 'antd';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: '🏠',
      label: '首页'
    },
    {
      key: '/match',
      icon: '💕',
      label: '智能匹配'
    },
    {
      key: '/chat',
      icon: '💬',
      label: '消息'
    },
    {
      key: '/posts',
      icon: '📝',
      label: '动态'
    },
    {
      key: '/moments',
      icon: '🌸',
      label: '朋友圈'
    },
    {
      key: '/short-videos',
      icon: '🎬',
      label: '短视频'
    },
    {
      key: '/live-list',
      icon: '📺',
      label: '直播'
    },
    {
      key: '/profile',
      icon: '👤',
      label: '我的'
    },
    {
      key: '/settings',
      icon: '⚙️',
      label: '设置'
    },
    {
      key: '/config',
      icon: '🔧',
      label: '配置中心',
      authRequired: true  // 需要管理员权限
    }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <AntLayout.Header style={{
        background: '#fff',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>赴缘</div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems.filter(item => !item.authRequired || token).map(item => ({
            key: item.key,
            label: item.label,
            icon: item.icon
          }))}
          onClick={({ key }) => navigate(key)}
        />
        {token && (
          <Button type="link" onClick={handleLogout} style={{ marginLeft: '20px' }}>
            退出登录
          </Button>
        )}
      </AntLayout.Header>

      <AntLayout.Content style={{ padding: '20px', background: '#f5f5f5' }}>
        <Outlet />
      </AntLayout.Content>
    </AntLayout>
  );
}

export default Layout;

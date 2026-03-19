import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spin } from 'antd';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';

// 路由懒加载 - 100%代码分割
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Match = lazy(() => import('./pages/Match'));
const ChatList = lazy(() => import('./pages/ChatList'));
const ChatDetail = lazy(() => import('./pages/ChatDetail'));
const Posts = lazy(() => import('./pages/Posts'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const PostCreate = lazy(() => import('./pages/PostCreate'));
const Moments = lazy(() => import('./pages/Moments'));
const ShortVideos = lazy(() => import('./pages/ShortVideos'));
const LiveList = lazy(() => import('./pages/LiveList'));
const LiveRoom = lazy(() => import('./pages/LiveRoom'));
const CreateLiveRoom = lazy(() => import('./pages/CreateLiveRoom'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const ConfigCenter = lazy(() => import('./pages/ConfigCenter'));

// 懒加载组件
const Loading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5'
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/match" element={<Match />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:userId" element={<ChatDetail />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/:postId" element={<PostDetail />} />
              <Route path="/posts/create" element={<PostCreate />} />
              <Route path="/moments" element={<Moments />} />
              <Route path="/short-videos" element={<ShortVideos />} />
              <Route path="/live-list" element={<LiveList />} />
              <Route path="/live-rooms/create" element={<CreateLiveRoom />} />
              <Route path="/live-rooms/:room_id" element={<LiveRoom />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/config" element={<ConfigCenter />} />
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

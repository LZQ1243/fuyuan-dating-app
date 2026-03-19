import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Match from './pages/Match';
import ChatList from './pages/ChatList';
import ChatDetail from './pages/ChatDetail';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';
import PostCreate from './pages/PostCreate';
import Moments from './pages/Moments';
import ShortVideos from './pages/ShortVideos';
import LiveList from './pages/LiveList';
import LiveRoom from './pages/LiveRoom';
import CreateLiveRoom from './pages/CreateLiveRoom';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ConfigCenter from './pages/ConfigCenter';
import NotFound from './pages/NotFound';
import { useAuthStore } from './store/auth';

const queryClient = new QueryClient();

function App() {
  const { token } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

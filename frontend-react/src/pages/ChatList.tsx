import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { List, Card, Badge, Button, Empty, Spin } from 'antd';
import io from 'socket.io-client';

interface Chat {
  user_id: string;
  nickname: string;
  avatar: string;
  online_status: boolean;
  last_message: string;
  last_time: string;
  unread_count: number;
}

function ChatList() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (token) {
      const socket = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket']
      });

      socket.connect();

      socket.on('message:receive', (message) => {
        console.log('收到新消息:', message);
        loadChatList();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token]);

  const loadChatList = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/chat/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.code === 200) {
        setChats(data.data.chat_list);
      }
    } catch (error) {
      console.error('获取聊天列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const enterChat = (userId: string, nickname: string) => {
    navigate(`/chat/${userId}`, {
      state: { nickname }
    });
  };

  useEffect(() => {
    if (token) {
      loadChatList();
    }
  }, [token]);

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>消息</h1>

        <Spin spinning={loading}>
          {chats.length === 0 ? (
            <Empty
              description="暂无消息"
              style={{ marginTop: '100px' }}
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={chats}
              renderItem={(chat: Chat) => (
                <List.Item
                  onClick={() => enterChat(chat.user_id, chat.nickname)}
                  style={{ padding: '20px', cursor: 'pointer', borderRadius: '10px' }}
                  actions={[
                    chat.unread_count > 0 && (
                      <Badge count={chat.unread_count} overflowCount={99} />
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={chat.avatar || '/default-avatar.png'}
                    title={<span style={{ fontSize: '16px' }}>{chat.nickname || '匿名'}</span>}
                    description={
                      <div>
                        <div style={{ color: '#666', marginBottom: '4px' }}>
                          {chat.last_message || '暂无消息'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {chat.last_time}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </div>
    </div>
  );
}

export default ChatList;

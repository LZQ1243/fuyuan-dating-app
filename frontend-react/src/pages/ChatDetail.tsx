import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Input, Button, Card, List, Avatar } from 'antd';
import { SendOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
import io from 'socket.io-client';

interface Message {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: string;
  timestamp: string;
  is_read: boolean;
}

function ChatDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      const socket = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket']
      });

      socket.connect();
      socket.emit('user:online', userId);

      socket.on('message:receive', (message: Message) => {
        console.log('收到消息:', message);
        setMessages(prev => [...prev, message]);
        setTimeout(() => scrollToBottom(), 100);
      });

      socket.on('message:sent', (message: Message) => {
        setMessages(prev => [...prev, message]);
        setTimeout(() => scrollToBottom(), 100);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, userId]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/chat/history/${userId}?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.code === 200) {
        setMessages(data.data.messages);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/chat/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: userId,
          content: inputValue.trim(),
          type: 'text'
        })
      });

      const data = await response.json();

      if (data.code === 200) {
        setInputValue('');
        // 消息将通过socket接收
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.code === 200) {
        await fetch('http://localhost:3000/api/chat/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiver_id: userId,
            content: data.data.url,
            type: 'image'
          })
        });
      }
    } catch (error) {
      console.error('上传图片失败:', error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [userId, token]);

  const isSelf = (senderId: string) => {
    // 这里需要获取当前用户ID
    return false; // 暂时返回false
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ marginBottom: '20px', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>聊天</h2>
          <Button onClick={() => navigate('/chat')}>返回列表</Button>
        </div>

        <List
          ref={messagesEndRef}
          style={{ flex: 1, overflow: 'auto', padding: '10px 0' }}
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={(message) => (
            <List.Item
              key={message.message_id}
              style={{
                justifyContent: isSelf(message.sender_id) ? 'flex-end' : 'flex-start'
              }}
            >
              <List.Item.Meta
                avatar={isSelf(message.sender_id) ? '/default-avatar.png' : '/default-avatar.png'}
                title={
                  <div style={{
                    display: 'flex',
                    flexDirection: isSelf(message.sender_id) ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      background: isSelf(message.sender_id) ? '#FF6B6B' : '#fff',
                      padding: '12px 16px',
                      borderRadius: '20px',
                      maxWidth: '70%'
                    }}>
                      {message.content}
                    </div>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {message.timestamp}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card style={{ borderRadius: '10px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={sendMessage}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={loading}
            onClick={sendMessage}
          >
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ChatDetail;

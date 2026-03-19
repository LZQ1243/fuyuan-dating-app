import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  message, 
  Modal, 
  Space, 
  Divider, 
  Switch, 
  List, 
  Avatar,
  Upload,
  Select,
  Tabs,
  Popconfirm
} from 'antd';
import {
  LockOutlined,
  BellOutlined,
  SafetyOutlined,
  UserOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useAuthStore } from '../store/auth';

const { TextArea } = Input;
const { Option } = Select;

interface NotificationSetting {
  type: string;
  label: string;
  description: string;
  enabled: boolean;
}

function Settings() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [activeTab, setActiveTab] = useState('account');
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certFileList, setCertFileList] = useState<UploadFile[]>([]);

  // 通知设置
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { type: 'message', label: '新消息提醒', description: '收到新消息时通知', enabled: true },
    { type: 'match', label: '匹配提醒', description: '有新的匹配对象时通知', enabled: true },
    { type: 'like', label: '点赞提醒', description: '有人点赞你的动态时通知', enabled: true },
    { type: 'comment', label: '评论提醒', description: '有人评论你的动态时通知', enabled: true },
    { type: 'follow', label: '关注提醒', description: '有人关注你时通知', enabled: false },
  ]);

  // 隐私设置
  const [privacySettings, setPrivacySettings] = useState({
    showLocation: false,
    showPhone: false,
    allowStrangerMessage: true,
    allowSearchByPhone: false,
  });

  // 修改密码
  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '修改失败');
      }

      message.success('密码修改成功，请重新登录');
      passwordForm.resetFields();
      setChangingPassword(false);
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error(error.message || '修改密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新通知设置
  const handleNotificationChange = (type: string, enabled: boolean) => {
    setNotifications(prev => 
      prev.map(item => 
        item.type === type ? { ...item, enabled } : item
      )
    );
    // TODO: 调用API保存设置
    message.success('设置已更新');
  };

  // 更新隐私设置
  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    // TODO: 调用API保存设置
    message.success('设置已更新');
  };

  // 退出登录
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      icon: <ExclamationCircleOutlined />,
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        logout();
        navigate('/login');
        message.success('已退出登录');
      },
    });
  };

  // 注销账号
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: '注销账号',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>注销后，您的所有数据将被永久删除，无法恢复：</p>
          <ul>
            <li>个人资料和设置</li>
            <li>聊天记录</li>
            <li>发布的动态</li>
            <li>匹配数据</li>
          </ul>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            此操作不可撤销，请谨慎操作！
          </p>
        </div>
      ),
      okText: '确认注销',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch('http://localhost:3000/api/user/delete-account', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('注销失败');
          }

          message.success('账号已注销');
          logout();
          navigate('/login');
        } catch (error) {
          message.error('注销失败，请重试');
        }
      },
    });
  };

  // 上传认证材料
  const handleUploadCert = () => {
    Modal.info({
      title: '上传认证材料',
      width: 600,
      content: (
        <div>
          <p>请上传以下材料进行实名认证：</p>
          <Upload
            listType="picture-card"
            fileList={certFileList}
            onChange={({ fileList }) => setCertFileList(fileList)}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          </Upload>
          <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            支持身份证、残疾证等材料的照片上传
          </p>
        </div>
      ),
      onOk: () => {
        message.success('认证材料已提交，请等待审核');
        setCertFileList([]);
      },
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
      <Space style={{ marginBottom: 20 }}>
        <Button onClick={() => navigate('/home')}>返回首页</Button>
        <Button onClick={() => navigate('/profile')}>
          <UserOutlined /> 个人资料
        </Button>
      </Space>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 账号安全 */}
          <Tabs.TabPane tab="账号安全" key="account">
            <div style={{ marginBottom: 24 }}>
              <h3>基本信息</h3>
              <List
                itemLayout="horizontal"
                dataSource={[
                  { label: '用户名', value: user?.username },
                  { label: '手机号', value: user?.phone },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.label}
                      description={item.value}
                    />
                  </List.Item>
                )}
              />
            </div>

            <Divider />

            <div>
              <h3>密码设置</h3>
              <Button 
                type="primary" 
                icon={<LockOutlined />}
                onClick={() => setChangingPassword(true)}
              >
                修改密码
              </Button>
            </div>

            <Divider />

            <div>
              <h3>实名认证</h3>
              <p style={{ color: '#666', marginBottom: 16 }}>
                完成实名认证可以提高账号安全性，享受更多功能
              </p>
              <Button 
                icon={<FileTextOutlined />}
                onClick={handleUploadCert}
              >
                上传认证材料
              </Button>
            </div>
          </Tabs.TabPane>

          {/* 通知设置 */}
          <Tabs.TabPane tab="通知设置" key="notification">
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Switch
                      checked={item.enabled}
                      onChange={(checked) => handleNotificationChange(item.type, checked)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<BellOutlined style={{ fontSize: 20 }} />}
                    title={item.label}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          {/* 隐私设置 */}
          <Tabs.TabPane tab="隐私设置" key="privacy">
            <List
              dataSource={[
                {
                  key: 'showLocation',
                  label: '显示位置信息',
                  description: '在个人资料中显示所在地区',
                  icon: <SafetyOutlined />,
                },
                {
                  key: 'showPhone',
                  label: '显示手机号',
                  description: '允许他人看到你的手机号',
                  icon: <SafetyOutlined />,
                },
                {
                  key: 'allowStrangerMessage',
                  label: '接收陌生人消息',
                  description: '允许未关注的人给你发消息',
                  icon: <SafetyOutlined />,
                },
                {
                  key: 'allowSearchByPhone',
                  label: '手机号搜索',
                  description: '允许他人通过手机号搜索到你',
                  icon: <SafetyOutlined />,
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Switch
                      checked={privacySettings[item.key as keyof typeof privacySettings]}
                      onChange={(checked) => handlePrivacyChange(item.key, checked)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.label}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>

          {/* 关于我们 */}
          <Tabs.TabPane tab="关于我们" key="about">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Avatar size={80} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
              <h2>赴缘</h2>
              <p style={{ color: '#666', marginBottom: 32 }}>
                专业的残障人士婚恋平台，让爱无障碍
              </p>
              
              <Divider />
              
              <div style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
                <h4>版本信息</h4>
                <p>当前版本：v1.0.0</p>
                
                <h4>联系我们</h4>
                <p>客服电话：400-XXX-XXXX</p>
                <p>邮箱：support@fuyuan.com</p>
                
                <h4>用户协议</h4>
                <Button type="link" style={{ padding: 0 }}>
                  用户服务协议
                </Button>
                <br />
                <Button type="link" style={{ padding: 0 }}>
                  隐私政策
                </Button>
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>

        <Divider />

        {/* 危险区域 */}
        <div>
          <h3 style={{ color: '#ff4d4f', marginBottom: 16 }}>危险区域</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              danger 
              block
              onClick={handleLogout}
            >
              <LogoutOutlined /> 退出登录
            </Button>
            <Popconfirm
              title="确认注销账号？"
              description="此操作不可撤销，您的所有数据将被永久删除"
              onConfirm={handleDeleteAccount}
              okText="确认"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button danger block icon={<DeleteOutlined />}>
                注销账号
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={changingPassword}
        onCancel={() => setChangingPassword(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="当前密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setChangingPassword(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Settings;

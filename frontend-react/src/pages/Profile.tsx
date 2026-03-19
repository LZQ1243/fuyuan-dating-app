import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Upload, 
  message, 
  Descriptions, 
  Space, 
  Modal, 
  Image, 
  Spin, 
  Tabs,
  List,
  Tag 
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  CameraOutlined, 
  SettingOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useAuthStore } from '../store/auth';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface UserProfile {
  _id: string;
  username: string;
  phone: string;
  gender: string;
  birthday: string;
  avatar: string;
  bio?: string;
  location?: string;
  height?: number;
  weight?: number;
  occupation?: string;
  education?: string;
  disabilityType?: string;
  disabilityLevel?: string;
  verified: boolean;
  registrationStep: number;
  createdAt: string;
}

interface Statistic {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function Profile() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const [form] = Form.useForm();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 加载用户资料
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('加载失败');
      }
      
      const data = await response.json();
      setProfile(data.data);
      
      // 填充表单
      form.setFieldsValue({
        username: data.data.username,
        bio: data.data.bio,
        location: data.data.location,
        height: data.data.height,
        weight: data.data.weight,
        occupation: data.data.occupation,
        education: data.data.education,
        disabilityType: data.data.disabilityType,
        disabilityLevel: data.data.disabilityLevel,
        birthday: data.data.birthday ? dayjs(data.data.birthday) : null,
      });
    } catch (error) {
      message.error('加载用户资料失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 保存资料
  const handleSave = async (values: any) => {
    try {
      setUploading(true);
      
      // 上传头像
      let avatarUrl = profile?.avatar;
      if (avatarFileList.length > 0 && avatarFileList[0].originFileObj) {
        avatarUrl = await uploadAvatar(avatarFileList[0].originFileObj);
      }

      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
          avatar: avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      message.success('保存成功');
      setEditing(false);
      loadProfile();
    } catch (error) {
      message.error('保存失败，请重试');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // 上传头像
  const uploadAvatar = async (file: File): Promise<string> => {
    // TODO: 实际项目中调用OSS上传
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://via.placeholder.com/200?text=avatar`);
      }, 500);
    });
  };

  // 统计数据
  const getStatistics = (): Statistic[] => [
    {
      label: '获得点赞',
      value: 128,
      icon: <HeartOutlined style={{ color: '#ff4d4f' }} />,
    },
    {
      label: '粉丝数量',
      value: 56,
      icon: <StarOutlined style={{ color: '#faad14' }} />,
    },
    {
      label: '发布动态',
      value: 23,
      icon: <TrophyOutlined style={{ color: '#52c41a' }} />,
    },
    {
      label: '安全分',
      value: 98,
      icon: <SafetyOutlined style={{ color: '#1890ff' }} />,
    },
  ];

  useEffect(() => {
    loadProfile();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const statistics = getStatistics();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>
      <Space style={{ marginBottom: 20 }}>
        <Button onClick={() => navigate('/home')}>返回首页</Button>
        <Button
          type="primary"
          onClick={() => navigate('/live-rooms/create')}
        >
          创建直播间
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={() => navigate('/settings')}
        >
          设置
        </Button>
      </Space>

      {/* 用户信息卡片 */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', marginRight: 24 }}>
            <Image
              width={120}
              height={120}
              src={profile.avatar}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              preview={false}
            />
            {editing && (
              <Upload
                showUploadList={false}
                fileList={avatarFileList}
                onChange={({ fileList }) => setAvatarFileList(fileList)}
                beforeUpload={() => false}
              >
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#1890ff',
                  color: 'white',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <CameraOutlined />
                </div>
              </Upload>
            )}
          </div>
          
          <div>
            <h2 style={{ marginBottom: 8 }}>
              {profile.username}
              {profile.verified && (
                <Tag color="blue" style={{ marginLeft: 12 }}>已认证</Tag>
              )}
            </h2>
            <p style={{ color: '#666', marginBottom: 4 }}>
              {profile.gender === 'male' ? '男' : '女'} · {profile.birthday ? `${new Date().getFullYear() - new Date(profile.birthday).getFullYear()}岁` : ''}
            </p>
            {profile.bio && (
              <p style={{ color: '#999' }}>{profile.bio}</p>
            )}
          </div>
        </div>

        {/* 统计数据 */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
          {statistics.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                {stat.icon}
                <span style={{ marginLeft: 8 }}>{stat.value}</span>
              </div>
              <div style={{ color: '#666', fontSize: 14 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {!editing ? (
          /* 查看模式 */
          <div>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => setEditing(true)}
            >
              编辑资料
            </Button>
            
            <Descriptions 
              column={2} 
              bordered 
              style={{ marginTop: 24 }}
            >
              <Descriptions.Item label="用户名">{profile.username}</Descriptions.Item>
              <Descriptions.Item label="手机号">{profile.phone}</Descriptions.Item>
              <Descriptions.Item label="性别">{profile.gender === 'male' ? '男' : '女'}</Descriptions.Item>
              <Descriptions.Item label="生日">{profile.birthday || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="地区">{profile.location || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="身高">{profile.height ? `${profile.height}cm` : '未设置'}</Descriptions.Item>
              <Descriptions.Item label="体重">{profile.weight ? `${profile.weight}kg` : '未设置'}</Descriptions.Item>
              <Descriptions.Item label="职业">{profile.occupation || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="学历">{profile.education || '未设置'}</Descriptions.Item>
              <Descriptions.Item label="残疾类型">{profile.disabilityType || '无'}</Descriptions.Item>
              <Descriptions.Item label="残疾等级">{profile.disabilityLevel || '无'}</Descriptions.Item>
              <Descriptions.Item label="注册日期">
                {new Date(profile.createdAt).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          /* 编辑模式 */
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <Tabs.TabPane tab="基本信息" key="basic">
                <Form.Item
                  label="用户名"
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="个人简介"
                  name="bio"
                >
                  <TextArea rows={4} placeholder="介绍一下自己..." />
                </Form.Item>

                <Form.Item
                  label="所在地区"
                  name="location"
                >
                  <Input placeholder="例如：北京市朝阳区" />
                </Form.Item>

                <Form.Item
                  label="生日"
                  name="birthday"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Tabs.TabPane>

              <Tabs.TabPane tab="详细信息" key="detail">
                <Form.Item label="身高" name="height">
                  <Input type="number" suffix="cm" />
                </Form.Item>

                <Form.Item label="体重" name="weight">
                  <Input type="number" suffix="kg" />
                </Form.Item>

                <Form.Item label="职业" name="occupation">
                  <Input />
                </Form.Item>

                <Form.Item label="学历" name="education">
                  <Select placeholder="请选择学历">
                    <Option value="high">高中</Option>
                    <Option value="college">大专</Option>
                    <Option value="bachelor">本科</Option>
                    <Option value="master">硕士</Option>
                    <Option value="doctor">博士</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="残疾类型" name="disabilityType">
                  <Select placeholder="如有残疾请选择类型">
                    <Option value="">无</Option>
                    <Option value="vision">视力残疾</Option>
                    <Option value="hearing">听力残疾</Option>
                    <Option value="speech">言语残疾</Option>
                    <Option value="physical">肢体残疾</Option>
                    <Option value="intellectual">智力残疾</Option>
                    <Option value="mental">精神残疾</Option>
                    <Option value="multiple">多重残疾</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="残疾等级" name="disabilityLevel">
                  <Select placeholder="请选择等级">
                    <Option value="">无</Option>
                    <Option value="level1">一级</Option>
                    <Option value="level2">二级</Option>
                    <Option value="level3">三级</Option>
                    <Option value="level4">四级</Option>
                  </Select>
                </Form.Item>
              </Tabs.TabPane>
            </Tabs>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={uploading}
                >
                  保存
                </Button>
                <Button onClick={() => setEditing(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
}

export default Profile;

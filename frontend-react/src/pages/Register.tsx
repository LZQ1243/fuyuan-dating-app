import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, DatePicker, Radio, Select } from 'antd';
import { useAuthStore } from '../store/auth';
import dayjs from 'dayjs';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: undefined,
    birthday: null,
    real_name: ''
  });

  const handleSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        birthday: values.birthday ? dayjs(values.birthday).format('YYYY-MM-DD') : null,
        gender: parseInt(values.gender)
      };

      await register(formattedValues);
      navigate('/');
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: '500px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>注册</h1>
        
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="请输入用户名"
              prefix="👤"
            />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]}
          >
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="请输入手机号"
              prefix="📱"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="请输入密码"
              prefix="🔒"
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value !== getFieldValue('password')) {
                    return Promise.reject('两次密码不一致');
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Input.Password
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="请再次输入密码"
              prefix="🔐"
            />
          </Form.Item>

          <Form.Item
            label="性别"
            name="gender"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Radio.Group
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <Radio value={1}>男</Radio>
              <Radio value={2}>女</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="生日"
            name="birthday"
            rules={[{ required: true, message: '请选择生日' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              value={form.birthday}
              onChange={(date) => setForm({ ...form, birthday: date })}
              placeholder="请选择生日"
              disabledDate={(current) => current && current > new Date()}
            />
          </Form.Item>

          <Form.Item
            label="真实姓名"
            name="real_name"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input
              value={form.real_name}
              onChange={(e) => setForm({ ...form, real_name: e.target.value })}
              placeholder="请输入真实姓名"
              prefix="📛"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ height: '50px', fontSize: '18px' }}
            >
              注册
            </Button>
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'center' }}>
              已有账号？ <Button type="link" onClick={() => navigate('/login')}>去登录</Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Register;

import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Switch, Select, Tag, Space } from 'antd';
import { PlusOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface LocationData {
  name: string;
  longitude: number;
  latitude: number;
}

const MomentCreate: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          setLocation({
            name: '当前位置',
            longitude,
            latitude
          });
          message.success('已获取位置');
        },
        (error) => {
          message.error('获取位置失败');
          console.error(error);
        }
      );
    } else {
      message.error('浏览器不支持地理定位');
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    } else if (tags.length >= 5) {
      message.warning('最多添加5个标签');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const uploadProps = {
    name: 'file',
    listType: 'picture-card',
    fileList: fileList,
    maxCount: 9,
    onPreview: async (file: UploadFile) => {
      let src = file.url as string;
      if (!src) {
        src = await new Promise(resolve => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as File);
          reader.onload = () => resolve(reader.result as string);
        });
      }
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    },
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
    },
    customRequest: async ({ onSuccess, file }: any) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.code === 200) {
          onSuccess?.(res.data.data.url, file);
          message.success('上传成功');
        } else {
          message.error(res.data.message || '上传失败');
        }
      } catch (error) {
        message.error('上传失败');
      }
    }
  };

  const handleSubmit = async (values: any) => {
    if (!values.content && fileList.length === 0) {
      message.warning('请输入内容或上传图片');
      return;
    }

    setSubmitting(true);
    try {
      const images = fileList
        .filter(file => file.url)
        .map(file => file.url);

      const res = await axios.post('/api/moments', {
        content: values.content || '',
        images,
        location,
        is_private: isPrivate,
        visible_to: [], // TODO: 可见用户选择
        tags
      });

      if (res.data.code === 200) {
        message.success('发布成功');
        navigate('/moments');
      } else {
        message.error(res.data.message || '发布失败');
      }
    } catch (error) {
      message.error('发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <h2>发布朋友圈</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item label="内容" name="content">
          <TextArea
            placeholder="分享你的想法..."
            autoSize={{ minRows: 4, maxRows: 8 }}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="图片">
          <Upload {...uploadProps}>
            {fileList.length < 9 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            最多上传9张图片
          </div>
        </Form.Item>

        <Form.Item label="位置">
          <Space>
            <Button
              icon={<CameraOutlined />}
              onClick={handleLocation}
            >
              {location ? location.name : '获取当前位置'}
            </Button>
            {location && (
              <Button danger onClick={() => setLocation(null)}>
                清除位置
              </Button>
            )}
          </Space>
        </Form.Item>

        <Form.Item label="标签">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Input
                style={{ width: 200 }}
                placeholder="输入标签（最多5个）"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={handleAddTag}
                maxLength={20}
              />
              <Button onClick={handleAddTag}>添加</Button>
            </Space>
            <Space wrap>
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                  color="blue"
                >
                  #{tag}
                </Tag>
              ))}
            </Space>
          </Space>
        </Form.Item>

        <Form.Item label="隐私设置">
          <Space>
            <Switch
              checked={isPrivate}
              onChange={setIsPrivate}
            />
            <span>仅部分人可见</span>
          </Space>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            size="large"
          >
            发布
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            onClick={() => navigate('/moments')}
            block
          >
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MomentCreate;

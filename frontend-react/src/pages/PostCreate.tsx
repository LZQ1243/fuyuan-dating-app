import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Upload, message, Space, Spin, Avatar, Select, Image } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, SendOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useAuthStore } from '../store/auth';

const { TextArea } = Input;
const { Option } = Select;

function PostCreate() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 图片预览处理
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // 上传配置
  const uploadProps: UploadProps = {
    listType: 'picture-card',
    fileList,
    onPreview: handlePreview,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isValidType = file.type.startsWith('image/');
      if (!isValidType) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片大小不能超过10MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
  };

  // 发布动态
  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('请输入动态内容');
      return;
    }

    if (postType === 'image' && fileList.length === 0) {
      message.warning('请至少上传一张图片');
      return;
    }

    try {
      setSubmitting(true);
      
      // 上传图片到OSS
      const uploadedImages: string[] = [];
      if (postType === 'image' && fileList.length > 0) {
        for (const file of fileList) {
          if (file.originFileObj) {
            const imageUrl = await uploadToOSS(file.originFileObj);
            uploadedImages.push(imageUrl);
          }
        }
      }

      // 创建帖子
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          type: postType,
          images: uploadedImages,
        }),
      });

      if (!response.ok) {
        throw new Error('发布失败');
      }

      message.success('发布成功！');
      navigate('/posts');
    } catch (error) {
      message.error('发布失败，请重试');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // 上传到OSS
  const uploadToOSS = async (file: File): Promise<string> => {
    // TODO: 实际项目中这里应该调用OSS上传接口
    // 这里暂时使用模拟数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`);
      }, 500);
    });
  };

  // 更换帖子类型
  const handleTypeChange = (value: 'text' | 'image' | 'video') => {
    setPostType(value);
    setFileList([]);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Space style={{ marginBottom: 20 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/posts')}
        >
          返回
        </Button>
      </Space>

      <Card title="发布动态">
        {/* 用户信息 */}
        <div style={{ marginBottom: 20 }}>
          <Avatar 
            size={48} 
            src={user?.avatar} 
            style={{ marginRight: 12 }}
          />
          <span style={{ fontSize: 16, fontWeight: 'bold' }}>
            {user?.username}
          </span>
        </div>

        {/* 动态类型选择 */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 12 }}>动态类型：</span>
          <Select 
            value={postType} 
            onChange={handleTypeChange}
            style={{ width: 120 }}
          >
            <Option value="text">纯文字</Option>
            <Option value="image">图片动态</Option>
            <Option value="video">视频动态</Option>
          </Select>
        </div>

        {/* 文字输入 */}
        <TextArea
          rows={6}
          placeholder="分享你的想法、心情或生活..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginBottom: 20, fontSize: 16 }}
          maxLength={500}
          showCount
        />

        {/* 图片上传 */}
        {postType === 'image' && (
          <div style={{ marginBottom: 20 }}>
            <Upload {...uploadProps} maxCount={9}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
            <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              最多上传9张图片，每张不超过10MB
            </p>
          </div>
        )}

        {/* 视频上传 */}
        {postType === 'video' && (
          <div style={{ marginBottom: 20 }}>
            <Upload
              listType="picture-card"
              accept="video/*"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={(file) => {
                const isValidVideo = file.type.startsWith('video/');
                if (!isValidVideo) {
                  message.error('只能上传视频文件！');
                  return false;
                }
                return false;
              }}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <CameraOutlined />
                  <div style={{ marginTop: 8 }}>上传视频</div>
                </div>
              )}
            </Upload>
            <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              最多上传1个视频，大小不超过100MB
            </p>
          </div>
        )}

        {/* 预览 */}
        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(''),
            }}
            src={previewImage}
          />
        )}

        {/* 提交按钮 */}
        <div style={{ textAlign: 'right' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={submitting || uploading}
          >
            发布动态
          </Button>
        </div>
      </Card>

      {/* 发布提示 */}
      <Card style={{ marginTop: 16 }}>
        <h4>发布须知：</h4>
        <ul style={{ fontSize: 14, color: '#666', lineHeight: 2 }}>
          <li>请遵守社区规范，发布健康积极的内容</li>
          <li>禁止发布违法、暴力、色情等不良信息</li>
          <li>尊重他人，文明交流，理性讨论</li>
          <li>严禁刷屏、广告等违规行为</li>
          <li>如有疑问，请联系客服</li>
        </ul>
      </Card>
    </div>
  );
}

export default PostCreate;

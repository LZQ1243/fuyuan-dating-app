import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  CloudDownload as CloudDownloadIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

/**
 * 配置项接口定义
 */
interface ConfigItem {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'password' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required: boolean;
  defaultValue?: string | number;
  options?: { value: string; label: string }[];
  tooltip?: string;
  hint?: string;
  step?: string;
  steps?: string[];
  example?: string;
  examples?: Record<string, string>;
  validation?: string;
  notes?: string;
  recommendations?: Record<string, string>;
  generateCommand?: string;
  badExamples?: string[];
}

/**
 * 配置分组接口定义
 */
interface ConfigGroup {
  id: string;
  title: string;
  icon: string;
  description: string;
  items: Record<string, ConfigItem>;
}

/**
 * 配置中心页面组件
 */
const ConfigCenter: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [configGroups, setConfigGroups] = useState<ConfigGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('environment');

  // 加载配置元数据
  useEffect(() => {
    loadConfigMetadata();
  }, []);

  // 加载配置值
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigMetadata = async () => {
    setLoadingMeta(true);
    try {
      const response = await fetch('http://localhost:3000/api/config/meta', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 200 && data.data) {
        // 将items从Record转换为数组
        const groups = data.data.map((group: ConfigGroup) => ({
          ...group,
          items: Object.entries(group.items || {}).map(([key, item]) => ({
            ...(item as ConfigItem),
            key
          }))
        }));
        setConfigGroups(groups);
      }
    } catch (error) {
      console.error('加载配置元数据失败:', error);
      setMessage({ type: 'error', text: '加载配置元数据失败，请检查网络连接' });
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 200) {
        setConfigs(data.data || {});
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      setMessage({ type: 'error', text: '加载配置失败，请检查网络连接' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentGroup = configGroups.find(g => g.id === selectedGroup);
      if (!currentGroup) return;

      const configData: any = {};
      currentGroup.items.forEach(item => {
        configData[item.key] = configs[item.key];
      });

      const response = await fetch(`http://localhost:3000/api/config/${selectedGroup}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });

      const data = await response.json();
      if (data.code === 200) {
        setMessage({ type: 'success', text: '配置保存成功！' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || '保存失败' });
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setMessage({ type: 'error', text: '保存配置失败，请检查网络连接' });
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/config/${selectedGroup}/reload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.code === 200) {
        setMessage({ type: 'success', text: '配置重新加载成功！' });
        loadConfigs();
      } else {
        setMessage({ type: 'error', text: data.message || '重新加载失败' });
      }
    } catch (error) {
      console.error('重新加载配置失败:', error);
      setMessage({ type: 'error', text: '重新加载配置失败' });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(configs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config-backup-${Date.now()}.json`;
    link.click();
  };

  const renderConfigField = (item: ConfigItem) => {
    const value = configs[item.key] !== undefined ? configs[item.key] : item.defaultValue;

    const handleChange = (e: any) => {
      setConfigs(prev => ({ ...prev, [item.key]: e.target.value }));
    };

    const commonProps = {
      fullWidth: true,
      required: item.required,
      label: (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle2" fontWeight="bold">
            {item.label}
          </Typography>
          {item.required && (
            <Chip size="small" color="error" label="必填" />
          )}
        </Box>
      ),
      value: value !== undefined ? String(value) : '',
      onChange: handleChange,
      helperText: item.description,
      InputProps: {
        endAdornment: (item.tooltip || item.example || item.steps) && (
          <Tooltip
            title={
              <Box sx={{ maxWidth: 400 }}>
                {item.tooltip && (
                  <Typography variant="body2" whiteSpace="pre-line" sx={{ mb: 1 }}>
                    {item.tooltip}
                  </Typography>
                )}
                {item.steps && item.steps.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      配置步骤：
                    </Typography>
                    {item.steps.map((step, idx) => (
                      <Typography key={idx} variant="body2" whiteSpace="pre-line">
                        {step}
                      </Typography>
                    ))}
                  </Box>
                )}
                {item.example && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                    示例：{item.example}
                  </Typography>
                )}
              </Box>
            }
            arrow
          >
            <HelpIcon color="info" />
          </Tooltip>
        )
      }
    };

    if (item.type === 'number') {
      return (
        <TextField
          {...commonProps}
          type="number"
          placeholder={item.placeholder}
        />
      );
    }

    if (item.type === 'password') {
      return (
        <TextField
          {...commonProps}
          type="password"
          placeholder={item.placeholder}
        />
      );
    }

    if (item.type === 'select') {
      return (
        <FormControl fullWidth required={item.required}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <InputLabel>{item.label}</InputLabel>
            {item.required && <Chip size="small" color="error" label="必填" />}
          </Box>
          <Select
            value={value !== undefined ? String(value) : ''}
            onChange={(e: any) => {
              setConfigs(prev => ({ ...prev, [item.key]: e.target.value }));
            }}
            label={item.label}
          >
            {item.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {item.description}
          </Typography>
        </FormControl>
      );
    }

    return (
      <TextField
        {...commonProps}
        type="text"
        placeholder={item.placeholder}
        multiline={item.type === 'textarea'}
        rows={item.type === 'textarea' ? 4 : 1}
      />
    );
  };

  if (loading || loadingMeta) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress size={60} />
        </Box>
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          {loadingMeta ? '加载配置元数据...' : '加载配置...'}
        </Typography>
      </Container>
    );
  }

  const currentGroup = configGroups.find(g => g.id === selectedGroup);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/settings')}
          sx={{ mb: 2 }}
        >
          返回
        </Button>
        <Typography variant="h4" gutterBottom>
          🔧 配置管理中心
        </Typography>
        <Typography variant="body1" color="textSecondary">
          统一管理所有系统配置，每个配置项都有详细的中文提示和使用步骤
        </Typography>
      </Box>

      {/* 消息提示 */}
      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* 配置分组选择 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {configGroups.map((group) => (
          <Chip
            key={group.id}
            label={group.icon + ' ' + group.title}
            onClick={() => setSelectedGroup(group.id)}
            color={selectedGroup === group.id ? 'primary' : 'default'}
            sx={{ cursor: 'pointer', fontSize: '0.9rem' }}
          />
        ))}
      </Box>

      {/* 当前配置组 */}
      {currentGroup && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* 分组标题 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {currentGroup.icon} {currentGroup.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {currentGroup.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* 步骤说明 */}
            {currentGroup.items.some(item => item.steps && item.steps.length > 0) && (
              <Alert severity="info" sx={{ mb: 2 }} icon={<HelpIcon />}>
                <Typography variant="body2" whiteSpace="pre-line">
                  <strong>配置步骤：</strong>
                  {currentGroup.items.filter(item => item.steps && item.steps.length > 0).map(item => (
                    <Box key={item.key} sx={{ mt: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {item.label}
                      </Typography>
                      {item.steps && item.steps.map((step, idx) => (
                        <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                          {step}
                        </Typography>
                      ))}
                    </Box>
                  ))}
                </Typography>
              </Alert>
            )}

            {/* 配置项 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {currentGroup.items.map((item) => (
                <Box key={item.key}>
                  {/* 提示信息 */}
                  {item.hint && (
                    <Alert severity="info" sx={{ mb: 1 }} icon={<InfoIcon />}>
                      <Typography variant="body2" whiteSpace="pre-line">
                        💡 {item.hint}
                      </Typography>
                    </Alert>
                  )}

                  {/* 注意事项 */}
                  {item.notes && (
                    <Alert severity="warning" sx={{ mb: 1 }} icon={<WarningIcon />}>
                      <Typography variant="body2" whiteSpace="pre-line">
                        ⚠️ {item.notes}
                      </Typography>
                    </Alert>
                  )}

                  {/* 配置字段 */}
                  {renderConfigField(item)}

                  {/* 详细说明折叠面板 */}
                  {(item.steps && item.steps.length > 0) || item.examples || item.recommendations || item.badExamples ? (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" color="primary">
                          查看详细配置说明
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* 配置步骤 */}
                        {item.steps && item.steps.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              📋 配置步骤：
                            </Typography>
                            <List dense>
                              {item.steps.map((step, idx) => (
                                <ListItem key={idx} sx={{ py: 0 }}>
                                  <ListItemText primary={`${idx + 1}. ${step}`} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* 示例 */}
                        {item.example && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              📝 示例：
                            </Typography>
                            <Alert severity="success" sx={{ mt: 0.5 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {item.example}
                              </Typography>
                            </Alert>
                          </Box>
                        )}

                        {/* 多个示例 */}
                        {item.examples && Object.keys(item.examples).length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              📝 多种示例：
                            </Typography>
                            {Object.entries(item.examples).map(([key, example]) => (
                              <Alert key={key} severity="success" sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="textSecondary" display="block">
                                  {key}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {example}
                                </Typography>
                              </Alert>
                            ))}
                          </Box>
                        )}

                        {/* 推荐值 */}
                        {item.recommendations && Object.keys(item.recommendations).length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              💡 推荐值：
                            </Typography>
                            {Object.entries(item.recommendations).map(([key, value]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip size="small" label={key} />
                                <Typography variant="body2">{value}</Typography>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* 生成命令 */}
                        {item.generateCommand && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              🔧 生成命令：
                            </Typography>
                            <Alert severity="info" sx={{ mt: 0.5 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {item.generateCommand}
                              </Typography>
                            </Alert>
                          </Box>
                        )}

                        {/* 不推荐的示例 */}
                        {item.badExamples && item.badExamples.length > 0 && (
                          <Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              ❌ 不推荐的配置：
                            </Typography>
                            {item.badExamples.map((badExample, idx) => (
                              <Alert key={idx} severity="error" sx={{ mt: 0.5 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {badExample}
                                </Typography>
                              </Alert>
                            ))}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                </Box>
              ))}
            </Box>

            {/* 操作按钮 */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReload}
              >
                重新加载
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存配置'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 全局操作 */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<CloudDownloadIcon />}
          onClick={handleExport}
        >
          导出所有配置
        </Button>
      </Box>
    </Container>
  );
};

export default ConfigCenter;

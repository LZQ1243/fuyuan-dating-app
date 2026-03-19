import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from '../../src/services/api';

vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确配置axios实例', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(api.defaults.timeout).toBeDefined();
  });

  it('应该正确发送GET请求', async () => {
    const mockData = { success: true, data: {} };
    vi.mocked(axios.get).mockResolvedValue({ data: mockData });

    const result = await api.get('/test');
    expect(result.data).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith('/test', undefined);
  });

  it('应该正确发送POST请求', async () => {
    const mockData = { success: true, data: {} };
    vi.mocked(axios.post).mockResolvedValue({ data: mockData });

    const payload = { test: 'data' };
    const result = await api.post('/test', payload);
    expect(result.data).toEqual(mockData);
    expect(axios.post).toHaveBeenCalledWith('/test', payload, undefined);
  });

  it('应该正确发送PUT请求', async () => {
    const mockData = { success: true, data: {} };
    vi.mocked(axios.put).mockResolvedValue({ data: mockData });

    const payload = { test: 'data' };
    const result = await api.put('/test', payload);
    expect(result.data).toEqual(mockData);
  });

  it('应该正确发送DELETE请求', async () => {
    const mockData = { success: true, data: {} };
    vi.mocked(axios.delete).mockResolvedValue({ data: mockData });

    const result = await api.delete('/test');
    expect(result.data).toEqual(mockData);
  });
});

/**
 * 严格的TypeScript类型定义
 * 替代any类型
 */

/**
 * 用户类型
 */
export interface User {
  _id: string;
  phone: string;
  nickname: string;
  avatar?: string;
  age: number;
  gender: 'male' | 'female';
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  interests?: string[];
  education?: string;
  profession?: string;
  income?: number;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 匹配类型
 */
export interface Match {
  _id: string;
  userId1: string;
  userId2: string;
  score: number;
  status: 'pending' | 'active' | 'rejected' | 'completed';
  createdAt: Date;
}

/**
 * 消息类型
 */
export interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'video';
  read: boolean;
  createdAt: Date;
}

/**
 * 动态类型
 */
export interface Moment {
  _id: string;
  userId: string;
  content: string;
  images?: string[];
  videos?: string[];
  likes: number;
  comments: number;
  isPrivate: boolean;
  createdAt: Date;
}

/**
 * API响应类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  timestamp: string;
}

/**
 * 验证错误类型
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 分页参数类型
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
}

/**
 * 分页响应类型
 */
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 缓存条目类型
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expireTime: number;
}

/**
 * WebSocket事件类型
 */
export interface SocketEvent {
  event: string;
  data: unknown;
  userId?: string;
  timestamp: number;
}

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalResources: number;
  totalSize: number;
  memoryUsed: number;
  memoryLimit: number;
}

/**
 * 配置类型
 */
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    enableMatch: boolean;
    enableChat: boolean;
    enableLive: boolean;
    enableMoments: boolean;
  };
  limits: {
    maxFileSize: number;
    maxImages: number;
    maxVideos: number;
  };
}

/**
 * 主题配置类型
 */
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  mode: 'light' | 'dark';
}

/**
 * 环境变量类型
 */
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URI: string;
  REDIS_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ALLOWED_ORIGINS: string;
}

/**
 * 日志级别类型
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * 日志条目类型
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * 错误类型
 */
export class AppError extends Error {
  public statusCode: number;
  public errors?: ValidationError[];
  
  constructor(message: string, statusCode: number = 500, errors?: ValidationError[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(field: string, message: string) {
    super('Validation failed', 400, [{ field, message }]);
    this.name = 'ValidationError';
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * 权限错误
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * 未找到错误
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 冲突错误
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 工具函数类型
 */
export type AsyncFunction<T = unknown, A = unknown[]> = (...args: A) => Promise<T>;

export type EventHandler<T = unknown> = (event: Event, data: T) => void;

export type Validator<T> = (value: unknown) => value is T;

export type Comparator<T> = (a: T, b: T) => number;

export type Mapper<T, U> = (item: T, index: number) => U;

export type Filter<T> = (item: T, index: number) => boolean;

export type Reducer<T, U> = (accumulator: U, currentValue: T, index: number) => U;

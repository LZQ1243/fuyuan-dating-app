/**
 * 请求签名验证中间件
 * 验证API请求的签名,防止请求被篡改
 */

const crypto = require('crypto');

class SignatureValidator {
  /**
   * 生成签名
   */
  static generateSignature(params, secret) {
    // 1. 按字母顺序排序参数
    const sortedKeys = Object.keys(params).sort();

    // 2. 拼接参数
    const paramString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 3. 添加密钥
    const stringToSign = `${paramString}&key=${secret}`;

    // 4. 计算HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    return signature;
  }

  /**
   * 验证签名
   */
  static validateSignature(params, signature, secret) {
    const generatedSignature = this.generateSignature(params, secret);
    return generatedSignature === signature;
  }

  /**
   * 验证时间戳
   */
  static validateTimestamp(timestamp, maxAge = 300000) { // 默认5分钟
    const now = Date.now();
    const requestTime = parseInt(timestamp, 10);

    if (isNaN(requestTime)) {
      return false;
    }

    const timeDiff = Math.abs(now - requestTime);
    return timeDiff <= maxAge;
  }

  /**
   * 验证nonce (防重放)
   */
  static async validateNonce(nonce, ttl = 300) { // 默认5分钟
    const redis = require('../config/redis');
    const key = `signature:nonce:${nonce}`;

    // 检查nonce是否已存在
    const exists = await redis.exists(key);

    if (exists) {
      return false; // 重复请求
    }

    // 存储nonce
    await redis.set(key, '1', 'EX', ttl);

    return true;
  }

  /**
   * 签名验证中间件
   */
  static middleware(options = {}) {
    const {
      secretKey = process.env.SIGNATURE_SECRET,
      maxAge = 300000, // 5分钟
      excludePaths = ['/health', '/docs', '/api-docs']
    } = options;

    return async (req, res, next) => {
      // 检查是否排除的路径
      if (excludePaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      try {
        // 获取签名参数
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];
        const nonce = req.headers['x-nonce'];

        if (!signature || !timestamp || !nonce) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Missing signature headers',
              code: 'MISSING_SIGNATURE'
            }
          });
        }

        // 验证时间戳
        if (!this.validateTimestamp(timestamp, maxAge)) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Invalid or expired timestamp',
              code: 'INVALID_TIMESTAMP'
            }
          });
        }

        // 验证nonce
        const isValidNonce = await this.validateNonce(nonce);

        if (!isValidNonce) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Duplicate request',
              code: 'DUPLICATE_REQUEST'
            }
          });
        }

        // 构建签名参数
        const params = {
          ...req.query,
          ...req.body,
          timestamp,
          nonce
        };

        // 删除签名相关的参数
        delete params.signature;

        // 验证签名
        const isValidSignature = this.validateSignature(
          params,
          signature,
          secretKey
        );

        if (!isValidSignature) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Invalid signature',
              code: 'INVALID_SIGNATURE'
            }
          });
        }

        // 签名验证通过
        next();
      } catch (error) {
        console.error('Signature validation error:', error);
        return res.status(500).json({
          success: false,
          error: {
            message: 'Signature validation failed',
            code: 'SIGNATURE_VALIDATION_ERROR'
          }
        });
      }
    };
  }

  /**
   * 为请求添加签名
   */
  static addSignatureToRequest(params, secret) {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const signatureParams = {
      ...params,
      timestamp,
      nonce
    };

    const signature = this.generateSignature(signatureParams, secret);

    return {
      params,
      headers: {
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce
      }
    };
  }
}

module.exports = SignatureValidator;

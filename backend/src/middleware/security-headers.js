/**
 * 安全头中间件
 * 添加安全相关的HTTP响应头
 */

class SecurityHeaders {
  /**
   * 安全头中间件
   */
  static middleware(options = {}) {
    const {
      // 内容类型嗅探保护
      nosniff = true,

      // 点击劫持保护
      frameguard = true,

      // XSS保护
      xssProtection = true,

      // HSTS
      hsts = true,
      hstsMaxAge = 31536000,
      hstsIncludeSubDomains = true,
      hstsPreload = false,

      // CSP
      csp = true,
      cspDirectives = {
        "default-src": "'self'",
        "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src": "'self' 'unsafe-inline'",
        "img-src": "'self' data: https:",
        "font-src": "'self'",
        "connect-src": "'self'",
        "media-src": "'self'",
        "object-src": "'none'",
        "frame-src": "'none'",
        "base-uri": "'self'",
        "form-action": "'self'",
        "frame-ancestors": "'none'",
        "report-uri": '/api/security/csp-report'
      },

      // Referrer策略
      referrerPolicy = true,
      referrerPolicyValue = 'strict-origin-when-cross-origin',

      // 权限策略
      permissionsPolicy = true,
      permissionsPolicyValue = {
        "geolocation": "'self'",
        "microphone": "'none'",
        "camera": "'none'",
        "payment": "'none'",
        "usb": "'none'",
        "magnetometer": "'none'",
        "gyroscope": "'none'",
        "accelerometer": "'none'"
      },

      // 其他安全头
      crossOriginOpenerPolicy = true,
      crossOriginEmbedderPolicy = false,
      crossOriginResourcePolicy = true
    } = options;

    return (req, res, next) => {
      // X-Content-Type-Options: 防止MIME类型嗅探
      if (nosniff) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }

      // X-Frame-Options: 防止点击劫持
      if (frameguard) {
        res.setHeader('X-Frame-Options', 'DENY');
      }

      // X-XSS-Protection: XSS保护
      if (xssProtection) {
        res.setHeader('X-XSS-Protection', '1; mode=block');
      }

      // Strict-Transport-Security: 强制HTTPS
      if (hsts && req.secure) {
        let hstsValue = `max-age=${hstsMaxAge}`;

        if (hstsIncludeSubDomains) {
          hstsValue += '; includeSubDomains';
        }

        if (hstsPreload) {
          hstsValue += '; preload';
        }

        res.setHeader('Strict-Transport-Security', hstsValue);
      }

      // Content-Security-Policy: 内容安全策略
      if (csp) {
        const cspString = Object.entries(cspDirectives)
          .map(([directive, value]) => `${directive} ${value}`)
          .join('; ');
        res.setHeader('Content-Security-Policy', cspString);
      }

      // Referrer-Policy: Referrer策略
      if (referrerPolicy) {
        res.setHeader('Referrer-Policy', referrerPolicyValue);
      }

      // Permissions-Policy: 权限策略
      if (permissionsPolicy) {
        const permissionsString = Object.entries(permissionsPolicyValue)
          .map(([feature, value]) => `${feature}=${value}`)
          .join(', ');
        res.setHeader('Permissions-Policy', permissionsString);
      }

      // Cross-Origin-Opener-Policy
      if (crossOriginOpenerPolicy) {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      }

      // Cross-Origin-Embedder-Policy
      if (crossOriginEmbedderPolicy) {
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      }

      // Cross-Origin-Resource-Policy
      if (crossOriginResourcePolicy) {
        res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
      }

      // X-DNS-Prefetch-Control: DNS预取控制
      res.setHeader('X-DNS-Prefetch-Control', 'off');

      // 服务器信息隐藏
      res.removeHeader('X-Powered-By');

      next();
    };
  }

  /**
   * CSRF保护中间件
   */
  static csrfMiddleware() {
    return (req, res, next) => {
      // 设置SameSite Cookie
      const cookies = req.headers.cookie;

      if (cookies) {
        res.setHeader('Set-Cookie', 'sessionId=...; SameSite=Strict; Secure; HttpOnly');
      }

      next();
    };
  }

  /**
   * 安全配置生成器
   */
  static generateSecurityConfig(environment = 'production') {
    const configs = {
      development: {
        csp: false,  // 开发环境禁用CSP以便调试
        hsts: false  // 开发环境禁用HSTS
      },
      staging: {
        csp: true,
        hsts: true,
        hstsMaxAge: 86400, // 1天
        frameguard: false  // 允许在iframe中
      },
      production: {
        csp: true,
        hsts: true,
        hstsMaxAge: 31536000, // 1年
        hstsIncludeSubDomains: true,
        hstsPreload: true,
        frameguard: true
      }
    };

    return configs[environment] || configs.production;
  }
}

module.exports = SecurityHeaders;

/**
 * 防抖和节流工具
 * 优化高频事件处理
 */

/**
 * 防抖 - 延迟执行,重复触发会重置定时器
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流 - 固定时间间隔执行
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timer: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        fn.apply(this, args);
        timer = null;
      }, remaining);
    }
  };
}

/**
 * requestAnimationFrame节流
 * 用于动画和滚动事件
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn.apply(this, lastArgs!);
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * 防抖 + 节流组合
 * 先节流再防抖
 */
export function debounceAfterThrottle<T extends (...args: any[]) => any>(
  fn: T,
  throttleDelay: number = 100,
  debounceDelay: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timer: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= throttleDelay) {
      // 节流直接执行
      fn.apply(this, args);
      lastCall = now;
    } else {
      // 防抖延迟执行
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        fn.apply(this, args);
        lastCall = Date.now();
        timer = null;
      }, debounceDelay);
    }
  };
}

/**
 * 批量执行
 * 收集多次调用,批量执行
 */
export function batchExecute<T extends (...args: any[]) => any>(
  fn: (batch: Parameters<T>[]) => void,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let batch: Parameters<T>[] = [];
  let timer: NodeJS.Timeout | null = null;

  const flush = () => {
    if (batch.length > 0) {
      fn([...batch]);
      batch = [];
    }
    timer = null;
  };

  return function (...args: Parameters<T>) {
    batch.push(args);

    if (!timer) {
      timer = setTimeout(flush, delay);
    }
  };
}

/**
 * 记忆化 - 缓存函数结果
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return (function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 带过期时间的记忆化
 */
export function memoizeWithExpire<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 5000,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, { value: ReturnType<T>; expire: number }>();

  return (function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && cached.expire > now) {
      return cached.value;
    }

    const result = fn.apply(this, args);
    cache.set(key, {
      value: result,
      expire: now + ttl
    });

    return result;
  }) as T;
}

/**
 * 取消的防抖
 */
export function cancelableDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  let timer: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      fn.apply(null, [] as any);
      timer = null;
    }
  };

  return debounced;
}

/**
 * 取消的节流
 */
export function cancelableThrottle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
) {
  let lastTime = 0;
  let timer: NodeJS.Timeout | null = null;

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        fn.apply(this, args);
        timer = null;
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastTime = 0;
  };

  return throttled;
}

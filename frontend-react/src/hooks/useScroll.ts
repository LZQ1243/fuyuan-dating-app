import { useState, useEffect } from 'react';

interface UseScrollOptions {
  threshold?: number;
  debounceMs?: number;
}

export const useScroll = ({ threshold = 100, debounceMs = 100 }: UseScrollOptions = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        // 检查是否超过阈值
        setIsScrolled(currentScrollY > threshold);

        // 检测滚动方向
        if (currentScrollY > lastScrollY) {
          setScrollDirection('down');
        } else if (currentScrollY < lastScrollY) {
          setScrollDirection('up');
        }

        setScrollY(currentScrollY);
        lastScrollY = currentScrollY;
      }, debounceMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [threshold, debounceMs]);

  return { isScrolled, scrollDirection, scrollY };
};

export const useScrollToBottom = (threshold = 100) => {
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 计算距离底部的距离
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

      setIsNearBottom(distanceFromBottom < threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return { isNearBottom };
};

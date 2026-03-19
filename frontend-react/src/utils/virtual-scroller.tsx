/**
 * 虚拟滚动组件 -极致性能优化
 * 支持大数据量列表渲染
 */

import React, { useRef, useMemo, useCallback, useEffect } from 'react';

interface VirtualScrollerProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualScroller<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualScrollerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);

  // 计算可见范围
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTopRef.current / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTopRef.current + containerHeight) / itemHeight) + overscan
    );
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, offsetY };
  }, [scrollTopRef.current, itemHeight, containerHeight, overscan, items.length]);

  // 可见项目
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  // 处理滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    scrollTopRef.current = scrollTop;
    onScroll?.(scrollTop);
  }, [onScroll]);

  // 重置滚动位置
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTopRef.current;
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={`virtual-scroller ${className}`}
      style={{
        height: `${containerHeight}px`,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${items.length * itemHeight}px`,
          position: 'relative'
        }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: `${(startIndex + index) * itemHeight}px`,
              left: 0,
              right: 0,
              height: `${itemHeight}px`
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 动态高度虚拟滚动
 */
export interface DynamicVirtualScrollerProps<T> {
  items: T[];
  estimatedItemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemHeight?: (item: T, index: number) => number;
  overscan?: number;
  className?: string;
}

export function DynamicVirtualScroller<T>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
  getItemHeight,
  overscan = 5,
  className = ''
}: DynamicVirtualScrollerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const itemHeightsRef = useRef<Map<number, number>>(new Map());
  const positionsRef = useRef<number[]>([]);

  // 计算项目位置
  const positions = useMemo(() => {
    const positions: number[] = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push(offset);
      const height = itemHeightsRef.current.get(i) || estimatedItemHeight;
      offset += height;
    }

    positionsRef.current = positions;
    return positions;
  }, [items.length, estimatedItemHeight]);

  // 查找起始索引
  const findStartIndex = useCallback((scrollTop: number): number => {
    let start = 0;
    let end = positions.length - 1;

    while (start < end) {
      const mid = Math.floor((start + end) / 2);
      if (positions[mid] <= scrollTop) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    return Math.max(0, start - 1);
  }, [positions]);

  // 计算可见范围
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, findStartIndex(scrollTopRef.current) - overscan);
    let endIndex = startIndex;

    // 计算结束索引
    let accumulatedHeight = 0;
    for (let i = startIndex; i < items.length; i++) {
      accumulatedHeight += itemHeightsRef.current.get(i) || estimatedItemHeight;
      if (accumulatedHeight > containerHeight + overscan * estimatedItemHeight) {
        break;
      }
      endIndex = i;
    }

    endIndex = Math.min(items.length - 1, endIndex + overscan);
    const offsetY = positions[startIndex];

    return { startIndex, endIndex, offsetY };
  }, [scrollTopRef.current, items.length, estimatedItemHeight, containerHeight, overscan, positions, findStartIndex]);

  // 可见项目
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  // 处理项目高度测量
  const handleItemResize = useCallback((index: number, height: number) => {
    const oldHeight = itemHeightsRef.current.get(index);
    if (oldHeight !== height) {
      itemHeightsRef.current.set(index, height);
    }
  }, []);

  // 处理滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    scrollTopRef.current = scrollTop;
  }, []);

  return (
    <div
      ref={containerRef}
      className={`dynamic-virtual-scroller ${className}`}
      style={{
        height: `${containerHeight}px`,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${positions[positions.length - 1] + items.length * estimatedItemHeight}px`,
          position: 'relative'
        }}
      >
        {visibleItems.map((item, index) => (
          <DynamicItem
            key={startIndex + index}
            index={startIndex + index}
            item={item}
            renderItem={renderItem}
            getItemHeight={getItemHeight}
            offsetY={offsetY}
            onResize={handleItemResize}
          />
        ))}
      </div>
    </div>
  );
}

interface DynamicItemProps<T> {
  index: number;
  item: T;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemHeight?: (item: T, index: number) => number;
  offsetY: number;
  onResize: (index: number, height: number) => void;
}

function DynamicItem<T>({
  index,
  item,
  renderItem,
  getItemHeight,
  offsetY,
  onResize
}: DynamicItemProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight;
      onResize(index, height);
    }
  }, [index, item, onResize]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: `${offsetY}px`,
        left: 0,
        right: 0
      }}
    >
      {renderItem(item, index)}
    </div>
  );
}

/**
 * 无限滚动虚拟列表
 */
export interface InfiniteVirtualScrollerProps<T> {
  fetchMore: () => Promise<T[]>;
  hasMore: boolean;
  loading?: boolean;
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function InfiniteVirtualScroller<T>({
  fetchMore,
  hasMore,
  loading = false,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: InfiniteVirtualScrollerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchMore();
      setItems(prev => [...prev, ...newItems]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, hasMore, isLoading]);

  // 检查是否滚动到底部
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // 接近底部200px时加载更多
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMore();
    }
  }, [loadMore]);

  return (
    <VirtualScroller
      items={items}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderItem}
      overscan={overscan}
      className={className}
      onScroll={handleScroll}
    />
  );
}

// 导出默认组件
export default VirtualScroller;

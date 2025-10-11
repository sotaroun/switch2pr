import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /** 初回読み込み関数 */
  onLoadMore: (cursor: string | null) => Promise<{ data: any[]; nextCursor: string | null; hasMore: boolean }>;
  /** 初期データ（オプション） */
  initialData?: any[];
  /** 読み込みトリガーまでの距離（px） */
  threshold?: number;
  /** 有効/無効 */
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  /** 現在のデータ一覧 */
  data: T[];
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** まだデータがあるか */
  hasMore: boolean;
  /** 監視要素にアタッチするref */
  observerRef: (node: HTMLDivElement | null) => void;
  /** 手動で次ページ読み込み */
  loadMore: () => void;
  /** データをリセット */
  reset: () => void;
}

/**
 * 無限スクロール機能を提供するカスタムフック
 * Intersection Observer APIを使用して自動読み込み
 * 
 * @example
 * ```tsx
 * const { data, isLoading, hasMore, observerRef } = useInfiniteScroll({
 *   onLoadMore: async (cursor) => {
 *     const response = await fetchComments(cursor);
 *     return {
 *       data: response.comments,
 *       nextCursor: response.pagination.nextCursor,
 *       hasMore: response.pagination.hasMore
 *     };
 *   }
 * });
 * ```
 */
export function useInfiniteScroll<T>({
  onLoadMore,
  initialData = [],
  threshold = 100,
  enabled = true
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false); // 二重読み込み防止

  /**
   * 次ページを読み込む
   */
  const loadMore = useCallback(async () => {
    // 二重読み込み防止
    if (isLoadingRef.current || !hasMore || !enabled) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await onLoadMore(nextCursor);
      
      setData(prev => [...prev, ...result.data]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('読み込みに失敗しました'));
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [nextCursor, hasMore, enabled, onLoadMore]);

  /**
   * データをリセット
   */
  const reset = useCallback(() => {
    setData(initialData);
    setNextCursor(null);
    setHasMore(true);
    setError(null);
    isLoadingRef.current = false;
  }, [initialData]);

  /**
   * Intersection Observerのセットアップ
   */
  useEffect(() => {
    if (!enabled || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingRef.current) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [enabled, hasMore, loadMore, threshold]);

  /**
   * 監視要素にアタッチするrefコールバック
   */
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    observerTarget.current = node;
  }, []);

  return {
    data,
    isLoading,
    error,
    hasMore,
    observerRef,
    loadMore,
    reset
  };
}